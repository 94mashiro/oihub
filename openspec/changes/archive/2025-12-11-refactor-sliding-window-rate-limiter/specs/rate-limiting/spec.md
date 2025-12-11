# Rate Limiting

## ADDED Requirements

### Requirement: Sliding Window QPS Control
RateLimiter SHALL use a sliding window algorithm to control requests per second. The limiter MUST allow at most `qps` requests within any 1-second window.

#### Scenario: Immediate execution when under limit
Given RateLimiter configured with qps=2
And no requests in the last 1 second
When a request is submitted
Then the request executes immediately without delay

#### Scenario: Burst requests within limit
Given RateLimiter configured with qps=2
And no requests in the last 1 second
When 2 requests are submitted simultaneously
Then both requests execute immediately

#### Scenario: Wait when limit exceeded
Given RateLimiter configured with qps=2
And 2 requests were made within the last 500ms
When a 3rd request is submitted
Then the request waits until the oldest request exits the 1-second window
And then executes

#### Scenario: Window slides over time
Given RateLimiter configured with qps=2
And 2 requests were made 900ms ago
When a new request is submitted after 100ms
Then the request executes immediately because the old requests have exited the window
