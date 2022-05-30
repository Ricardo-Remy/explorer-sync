import { RequestResponseInterceptor } from './request-response.interceptor';

describe('WrapResponseInterceptor', () => {
  it('should be defined', () => {
    expect(new RequestResponseInterceptor()).toBeDefined();
  });
});
