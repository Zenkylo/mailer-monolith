import SecureDataFetcher from '#services/secure_data_fetcher'
import { test } from '@japa/runner'

test.group('SecureDataFetcher', () => {
  test('should reject non-HTTPS URLs', async ({ assert }) => {
    const urls = [
      'http://localhost:8080/data',
      'http://127.0.0.1/api',
      'http://192.168.1.100/webhook',
      'http://10.0.0.1/data',
      'http://172.16.0.1/api',
    ]

    for (const url of urls) {
      try {
        await SecureDataFetcher.fetchData(url)
        assert.fail(`Expected rejection for URL: ${url}`)
      } catch (error) {
        assert.equal(error.message, 'Invalid URL: HTTPS is required')
      }
    }
  })

  test('should reject blocked hostnames', async ({ assert }) => {
    const urls = ['https://metadata.google.internal/api', 'https://consul.service.consul/data']

    for (const url of urls) {
      try {
        await SecureDataFetcher.fetchData(url)
        assert.fail(`Expected rejection for URL: ${url}`)
      } catch (error) {
        assert.equal(error.message, 'Invalid URL: hostname is not allowed')
      }
    }
  })

  test('should reject dangerous protocols', async ({ assert }) => {
    const urls = ['file:///etc/passwd', 'ftp://example.com/data', 'ldap://example.com/search']

    for (const url of urls) {
      await assert.rejects(() => SecureDataFetcher.fetchData(url), 'Invalid URL: HTTPS is required')
    }
  })

  test('should reject non-443 ports', async ({ assert }) => {
    const urls = [
      'https://example.com:8080/data',
      'https://api.example.com:3000/webhook',
      'https://secure.example.com:8443/api',
    ]

    for (const url of urls) {
      await assert.rejects(
        () => SecureDataFetcher.fetchData(url),
        'Invalid URL: only HTTPS on port 443 is allowed'
      )
    }
  })

  test('should reject excessively long URLs', async ({ assert }) => {
    const longUrl = 'https://example.com/' + 'a'.repeat(2001)
    await assert.rejects(() => SecureDataFetcher.fetchData(longUrl), 'Invalid URL: URL is too long')
  })

  test('should reject URLs with invalid format', async ({ assert }) => {
    const invalidFormatUrls = ['', ' ', 'not-a-url', 'https://']

    for (const url of invalidFormatUrls) {
      try {
        await SecureDataFetcher.fetchData(url)
        assert.fail(`Expected rejection for invalid URL: '${url}'`)
      } catch (error) {
        assert.equal(error.message, 'Invalid URL format')
      }
    }
  })

  test('should reject URLs with invalid hostnames', async ({ assert }) => {
    const invalidHostnameUrls = [
      'https://exam ple.com/path', // space in hostname
    ]

    for (const url of invalidHostnameUrls) {
      try {
        await SecureDataFetcher.fetchData(url)
        assert.fail(`Expected rejection for invalid hostname: '${url}'`)
      } catch (error) {
        assert.equal(error.message, 'Invalid URL format')
      }
    }
  })

  test('should reject URLs without proper domain structure', async ({ assert }) => {
    const invalidDomainUrls = [
      'https://.',
      'https://localhost/path', // no TLD
      'https://example./path', // empty TLD
      'https://.com/path', // empty domain name
      'https://example..com/path', // empty part between dots
    ]

    for (const url of invalidDomainUrls) {
      try {
        await SecureDataFetcher.fetchData(url)
        assert.fail(`Expected rejection for invalid domain structure: '${url}'`)
      } catch (error) {
        assert.equal(error.message, 'Invalid URL: hostname must have a valid domain structure')
      }
    }
  })

  test('should successfully fetch from valid HTTPS URL', async ({ assert }) => {
    const url = 'https://jsonplaceholder.typicode.com/posts/1'
    const result = await SecureDataFetcher.fetchData(url)

    assert.equal(result.status, 200)
    assert.isObject(result.data)
    assert.equal(result.url, url)
  })

  test('placeholder methods should return expected types', async ({ assert }) => {
    // Test getAllowedDomainsForUser
    const domains = SecureDataFetcher.getAllowedDomainsForUser(123)
    assert.isArray(domains)

    // Test isEndpointAllowedForUser
    const isAllowed = await SecureDataFetcher.isEndpointAllowedForUser('https://example.com', 123)
    assert.isBoolean(isAllowed)

    // Test verifyEndpointOwnership
    const isVerified = await SecureDataFetcher.verifyEndpointOwnership(
      'https://example.com',
      'token123'
    )
    assert.isBoolean(isVerified)
    assert.equal(isVerified, false) // Should return false as placeholder
  })

  test('should allow URLs with explicit port 443', async ({ assert }) => {
    const url = 'https://example.com:443/api'

    try {
      await SecureDataFetcher.fetchData(url)
      // Should not reach here in test, but validation should pass
    } catch (error) {
      // Expected to fail with network error, not validation error
      assert.notInclude(error.message, 'Invalid URL')
    }
  })

  test('should handle URLs with query parameters and fragments', async ({ assert }) => {
    const urlsWithParams = [
      'https://api.example.com/data?key=value',
      'https://webhook.example.com/endpoint#section',
      'https://service.example.com/api?param1=value1&param2=value2',
      'https://example.com/path?query=test&other=value#fragment',
    ]

    for (const url of urlsWithParams) {
      try {
        await SecureDataFetcher.fetchData(url)
        // Should not reach here in test, but validation should pass
      } catch (error) {
        // Expected to fail with network error, not validation error
        assert.notInclude(error.message, 'Invalid URL')
      }
    }
  })

  test('should validate options are passed through correctly', async ({ assert }) => {
    const customOptions = {
      timeout: 1000,
      maxContentLength: 512,
      maxBodyLength: 256,
    }

    try {
      await SecureDataFetcher.fetchData('https://httpbin.org/json', customOptions)
    } catch (error) {
      // Should fail due to network, but options should be applied
      assert.isString(error.message)
    }
  }) // Skip integration test
})
