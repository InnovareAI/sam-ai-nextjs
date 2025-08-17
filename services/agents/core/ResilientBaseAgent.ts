/**
 * Resilient Base Agent with Circuit Breaker, Retry Logic, and Performance Monitoring
 * Addresses the critical issues found in stress testing
 */

import { BaseAgent } from '../types/AgentTypes';
import { 
  AgentConfig, 
  AgentType, 
  TaskRequest, 
  TaskResponse, 
  AgentCapability,
  ConversationContext 
} from '../types/AgentTypes';
import { 
  CircuitBreaker, 
  CircuitBreakerFactory, 
  CircuitBreakerError,
  AGENT_CIRCUIT_CONFIGS 
} from '../../resilience/CircuitBreaker';

export interface RetryConfig {
  maxRetries: number;
  baseDelayMs: number;
  maxDelayMs: number;
  exponentialBase: number;
  jitterMs: number;
}

export interface PerformanceMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  lastRequestTime?: number;
  lastSuccessTime?: number;
  lastErrorTime?: number;
  circuitBreakerStats: any;
}

export abstract class ResilientBaseAgent extends BaseAgent {
  protected circuitBreaker: CircuitBreaker;
  protected retryConfig: RetryConfig;
  protected performanceMetrics: PerformanceMetrics;
  private requestHistory: number[] = [];

  constructor(agentType: AgentType, config: AgentConfig) {
    super(agentType, config);
    
    // Initialize circuit breaker with agent-specific configuration
    const circuitConfig = AGENT_CIRCUIT_CONFIGS[agentType] || AGENT_CIRCUIT_CONFIGS.qa_agent;
    this.circuitBreaker = CircuitBreakerFactory.getCircuitBreaker(agentType, circuitConfig);
    
    // Default retry configuration
    this.retryConfig = {
      maxRetries: 3,
      baseDelayMs: 1000,
      maxDelayMs: 10000,
      exponentialBase: 2,
      jitterMs: 500
    };
    
    // Initialize performance metrics
    this.performanceMetrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageResponseTime: 0,
      circuitBreakerStats: null
    };
  }

  /**
   * Enhanced processTask with resilience patterns
   */
  async processTask(task: TaskRequest, context: ConversationContext): Promise<TaskResponse> {
    const startTime = Date.now();
    this.performanceMetrics.totalRequests++;
    this.performanceMetrics.lastRequestTime = startTime;

    try {
      // Execute task with circuit breaker protection and retry logic
      const result = await this.executeWithResilience(
        () => this.processTaskInternal(task, context),
        `${this.agentType}_task_${task.id}`
      );

      // Record success metrics
      const responseTime = Date.now() - startTime;
      this.recordSuccess(responseTime);
      
      return this.createTaskResponse(
        task.id,
        result,
        true,
        undefined,
        {
          processingTime: responseTime,
          confidence: 0.9,
          circuitBreakerState: this.circuitBreaker.getState(),
          retryCount: 0
        }
      );

    } catch (error) {
      // Record failure metrics
      const responseTime = Date.now() - startTime;
      this.recordFailure(responseTime, error);
      
      // Return error response with resilience information
      return this.createTaskResponse(
        task.id,
        { 
          type: 'error', 
          data: { 
            error: error.message,
            circuitBreakerState: this.circuitBreaker.getState(),
            isCircuitBreakerError: error instanceof CircuitBreakerError
          } 
        },
        false,
        error.message,
        {
          processingTime: responseTime,
          confidence: 0.1,
          circuitBreakerState: this.circuitBreaker.getState()
        }
      );
    }
  }

  /**
   * Execute operation with circuit breaker and retry logic
   */
  protected async executeWithResilience<T>(
    operation: () => Promise<T>,
    operationName: string
  ): Promise<T> {
    return await this.circuitBreaker.execute(async () => {
      return await this.executeWithRetry(operation, operationName);
    });
  }

  /**
   * Execute operation with exponential backoff retry
   */
  private async executeWithRetry<T>(
    operation: () => Promise<T>,
    operationName: string,
    attempt: number = 1
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      if (attempt >= this.retryConfig.maxRetries) {
        console.error(`❌ ${this.agentType} failed after ${attempt} attempts:`, error.message);
        throw error;
      }

      // Calculate delay with exponential backoff and jitter
      const delay = Math.min(
        this.retryConfig.baseDelayMs * Math.pow(this.retryConfig.exponentialBase, attempt - 1),
        this.retryConfig.maxDelayMs
      ) + Math.random() * this.retryConfig.jitterMs;

      console.warn(`⚠️  ${this.agentType} attempt ${attempt} failed, retrying in ${delay.toFixed(0)}ms:`, error.message);
      
      await new Promise(resolve => setTimeout(resolve, delay));
      return this.executeWithRetry(operation, operationName, attempt + 1);
    }
  }

  /**
   * Record successful operation metrics
   */
  private recordSuccess(responseTime: number): void {
    this.performanceMetrics.successfulRequests++;
    this.performanceMetrics.lastSuccessTime = Date.now();
    this.recordResponseTime(responseTime);
  }

  /**
   * Record failed operation metrics
   */
  private recordFailure(responseTime: number, error: any): void {
    this.performanceMetrics.failedRequests++;
    this.performanceMetrics.lastErrorTime = Date.now();
    this.recordResponseTime(responseTime);
    
    console.error(`❌ ${this.agentType} operation failed:`, {
      error: error.message,
      responseTime,
      circuitState: this.circuitBreaker.getState()
    });
  }

  /**
   * Record response time for moving average calculation
   */
  private recordResponseTime(responseTime: number): void {
    this.requestHistory.push(responseTime);
    
    // Keep only last 100 requests for moving average
    if (this.requestHistory.length > 100) {
      this.requestHistory.shift();
    }
    
    // Calculate moving average
    this.performanceMetrics.averageResponseTime = 
      this.requestHistory.reduce((sum, time) => sum + time, 0) / this.requestHistory.length;
  }

  /**
   * Get current performance metrics
   */
  getPerformanceMetrics(): PerformanceMetrics {
    return {
      ...this.performanceMetrics,
      circuitBreakerStats: this.circuitBreaker.getStats()
    };
  }

  /**
   * Enhanced health check with circuit breaker status
   */
  async healthCheck(): Promise<boolean> {
    try {
      const isHealthy = this.isInitialized && this.circuitBreaker.isHealthy();
      const metrics = this.getPerformanceMetrics();
      
      // Consider agent unhealthy if error rate > 30% in recent requests
      const errorRate = metrics.totalRequests > 0 ? 
        metrics.failedRequests / metrics.totalRequests : 0;
      
      const isPerformanceHealthy = errorRate < 0.3 && metrics.averageResponseTime < 30000;
      
      return isHealthy && isPerformanceHealthy;
    } catch (error) {
      console.error(`Health check failed for ${this.agentType}:`, error);
      return false;
    }
  }

  /**
   * Reset agent state and circuit breaker
   */
  async reset(): Promise<void> {
    this.circuitBreaker.reset();
    this.requestHistory = [];
    this.performanceMetrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageResponseTime: 0,
      circuitBreakerStats: null
    };
    console.log(`🔄 ${this.agentType} reset completed`);
  }

  /**
   * Configure retry behavior
   */
  protected configureRetry(config: Partial<RetryConfig>): void {
    this.retryConfig = { ...this.retryConfig, ...config };
  }

  /**
   * Check if agent is currently throttled by circuit breaker
   */
  isThrottled(): boolean {
    return !this.circuitBreaker.isHealthy();
  }

  /**
   * Get detailed agent status
   */
  getStatus(): {
    agentType: AgentType;
    isHealthy: boolean;
    isThrottled: boolean;
    metrics: PerformanceMetrics;
    lastActivity: string;
  } {
    const metrics = this.getPerformanceMetrics();
    return {
      agentType: this.agentType,
      isHealthy: this.circuitBreaker.isHealthy(),
      isThrottled: this.isThrottled(),
      metrics,
      lastActivity: metrics.lastRequestTime ? 
        new Date(metrics.lastRequestTime).toISOString() : 'Never'
    };
  }

  /**
   * Abstract method for actual task processing (to be implemented by subclasses)
   */
  protected abstract processTaskInternal(
    task: TaskRequest, 
    context: ConversationContext
  ): Promise<any>;

  /**
   * Enhanced shutdown with cleanup
   */
  async shutdown(): Promise<void> {
    try {
      await this.reset();
      console.log(`🛑 ${this.agentType} shutdown completed`);
    } catch (error) {
      console.error(`Error during ${this.agentType} shutdown:`, error);
    }
  }
}