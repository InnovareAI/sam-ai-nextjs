/**
 * Circuit Breaker Pattern Implementation
 * Prevents cascading failures and provides graceful degradation for external API calls
 */

export interface CircuitBreakerConfig {
  failureThreshold: number;    // Number of failures before opening circuit
  successThreshold: number;    // Number of successes to close circuit
  timeout: number;            // Timeout in milliseconds
  resetTimeoutMs: number;     // Time to wait before trying again
  monitoringPeriodMs: number; // Period to monitor for failures
}

export interface CircuitBreakerStats {
  state: CircuitState;
  failureCount: number;
  successCount: number;
  lastFailureTime?: number;
  lastSuccessTime?: number;
  totalRequests: number;
  totalFailures: number;
  uptime: number;
}

export enum CircuitState {
  CLOSED = 'CLOSED',     // Normal operation
  OPEN = 'OPEN',         // Circuit is open, rejecting requests
  HALF_OPEN = 'HALF_OPEN' // Testing if service is back
}

export class CircuitBreakerError extends Error {
  constructor(message: string, public readonly state: CircuitState) {
    super(message);
    this.name = 'CircuitBreakerError';
  }
}

export class CircuitBreaker<T = any> {
  private state: CircuitState = CircuitState.CLOSED;
  private failureCount = 0;
  private successCount = 0;
  private lastFailureTime?: number;
  private lastSuccessTime?: number;
  private nextAttemptTime = 0;
  private totalRequests = 0;
  private totalFailures = 0;
  private startTime = Date.now();

  constructor(
    private readonly name: string,
    private readonly config: CircuitBreakerConfig
  ) {}

  /**
   * Execute a function with circuit breaker protection
   */
  async execute<R>(fn: () => Promise<R>): Promise<R> {
    this.totalRequests++;

    // Check if circuit is open
    if (this.state === CircuitState.OPEN) {
      if (Date.now() < this.nextAttemptTime) {
        throw new CircuitBreakerError(
          `Circuit breaker ${this.name} is OPEN. Next attempt in ${this.nextAttemptTime - Date.now()}ms`,
          CircuitState.OPEN
        );
      } else {
        // Transition to half-open to test the service
        this.state = CircuitState.HALF_OPEN;
        this.successCount = 0;
        console.log(`🔄 Circuit breaker ${this.name} transitioning to HALF_OPEN`);
      }
    }

    try {
      const result = await this.executeWithTimeout(fn);
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  /**
   * Execute function with timeout protection
   */
  private async executeWithTimeout<R>(fn: () => Promise<R>): Promise<R> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`Timeout after ${this.config.timeout}ms`));
      }, this.config.timeout);

      fn()
        .then(result => {
          clearTimeout(timer);
          resolve(result);
        })
        .catch(error => {
          clearTimeout(timer);
          reject(error);
        });
    });
  }

  /**
   * Handle successful execution
   */
  private onSuccess(): void {
    this.successCount++;
    this.lastSuccessTime = Date.now();
    this.failureCount = 0; // Reset failure count on success

    if (this.state === CircuitState.HALF_OPEN) {
      if (this.successCount >= this.config.successThreshold) {
        this.state = CircuitState.CLOSED;
        console.log(`✅ Circuit breaker ${this.name} is now CLOSED (recovered)`);
      }
    }
  }

  /**
   * Handle failed execution
   */
  private onFailure(): void {
    this.failureCount++;
    this.totalFailures++;
    this.lastFailureTime = Date.now();

    if (this.state === CircuitState.HALF_OPEN) {
      // Any failure in half-open state should open the circuit again
      this.openCircuit();
    } else if (this.failureCount >= this.config.failureThreshold) {
      this.openCircuit();
    }
  }

  /**
   * Open the circuit breaker
   */
  private openCircuit(): void {
    this.state = CircuitState.OPEN;
    this.nextAttemptTime = Date.now() + this.config.resetTimeoutMs;
    console.log(`🚨 Circuit breaker ${this.name} is now OPEN for ${this.config.resetTimeoutMs}ms`);
  }

  /**
   * Get current statistics
   */
  getStats(): CircuitBreakerStats {
    return {
      state: this.state,
      failureCount: this.failureCount,
      successCount: this.successCount,
      lastFailureTime: this.lastFailureTime,
      lastSuccessTime: this.lastSuccessTime,
      totalRequests: this.totalRequests,
      totalFailures: this.totalFailures,
      uptime: Date.now() - this.startTime
    };
  }

  /**
   * Check if circuit breaker is healthy
   */
  isHealthy(): boolean {
    return this.state === CircuitState.CLOSED;
  }

  /**
   * Manually reset the circuit breaker
   */
  reset(): void {
    this.state = CircuitState.CLOSED;
    this.failureCount = 0;
    this.successCount = 0;
    this.nextAttemptTime = 0;
    console.log(`🔄 Circuit breaker ${this.name} manually reset`);
  }

  /**
   * Get current state
   */
  getState(): CircuitState {
    return this.state;
  }
}

/**
 * Circuit Breaker Factory for managing multiple circuit breakers
 */
export class CircuitBreakerFactory {
  private static breakers = new Map<string, CircuitBreaker>();

  /**
   * Get or create a circuit breaker for a specific service
   */
  static getCircuitBreaker(
    name: string, 
    config: Partial<CircuitBreakerConfig> = {}
  ): CircuitBreaker {
    if (!this.breakers.has(name)) {
      const defaultConfig: CircuitBreakerConfig = {
        failureThreshold: 5,
        successThreshold: 3,
        timeout: 10000,
        resetTimeoutMs: 30000,
        monitoringPeriodMs: 60000,
        ...config
      };
      
      this.breakers.set(name, new CircuitBreaker(name, defaultConfig));
    }
    
    return this.breakers.get(name)!;
  }

  /**
   * Get all circuit breaker statistics
   */
  static getAllStats(): Record<string, CircuitBreakerStats> {
    const stats: Record<string, CircuitBreakerStats> = {};
    
    this.breakers.forEach((breaker, name) => {
      stats[name] = breaker.getStats();
    });
    
    return stats;
  }

  /**
   * Check system health across all circuit breakers
   */
  static getSystemHealth(): {
    healthy: boolean;
    totalBreakers: number;
    healthyBreakers: number;
    openBreakers: string[];
  } {
    const openBreakers: string[] = [];
    let healthyCount = 0;
    
    this.breakers.forEach((breaker, name) => {
      if (breaker.isHealthy()) {
        healthyCount++;
      } else if (breaker.getState() === CircuitState.OPEN) {
        openBreakers.push(name);
      }
    });
    
    return {
      healthy: openBreakers.length === 0,
      totalBreakers: this.breakers.size,
      healthyBreakers: healthyCount,
      openBreakers
    };
  }

  /**
   * Reset all circuit breakers
   */
  static resetAll(): void {
    this.breakers.forEach((breaker) => {
      breaker.reset();
    });
    console.log('🔄 All circuit breakers reset');
  }
}

// Agent-specific circuit breaker configurations
export const AGENT_CIRCUIT_CONFIGS: Record<string, CircuitBreakerConfig> = {
  qa_agent: {
    failureThreshold: 3,
    successThreshold: 2,
    timeout: 15000,      // 15s timeout for Q&A processing
    resetTimeoutMs: 30000,
    monitoringPeriodMs: 60000
  },
  n8n_agent: {
    failureThreshold: 5,
    successThreshold: 3,
    timeout: 10000,      // 10s timeout for workflow validation
    resetTimeoutMs: 20000,
    monitoringPeriodMs: 60000
  },
  apify_agent: {
    failureThreshold: 3,
    successThreshold: 2,
    timeout: 30000,      // 30s timeout for scraping operations
    resetTimeoutMs: 60000,
    monitoringPeriodMs: 120000
  },
  unipile_agent: {
    failureThreshold: 4,
    successThreshold: 2,
    timeout: 20000,      // 20s timeout for email/calendar operations
    resetTimeoutMs: 45000,
    monitoringPeriodMs: 90000
  },
  supabase_agent: {
    failureThreshold: 5,
    successThreshold: 3,
    timeout: 8000,       // 8s timeout for database operations
    resetTimeoutMs: 15000,
    monitoringPeriodMs: 60000
  },
  prompt_engineer: {
    failureThreshold: 4,
    successThreshold: 2,
    timeout: 12000,      // 12s timeout for prompt optimization
    resetTimeoutMs: 25000,
    monitoringPeriodMs: 60000
  }
};