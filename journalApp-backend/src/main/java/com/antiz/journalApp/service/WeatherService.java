package com.antiz.journalApp.service;

import com.antiz.journalApp.api.response.WeatherResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

@Service
public class WeatherService {
    private static final Logger log = LoggerFactory.getLogger(WeatherService.class);
    private static final String CACHE_KEY_PREFIX = "weather_of_";
    private static final String API = "https://api.weatherstack.com/current?access_key=%s&query=%s";
    private static final long CACHE_TTL_SECONDS = 300L;

    private final String apiKey;

    public WeatherService(@Value("${app.weather.api-key}") String apiKey) {
        this.apiKey = apiKey;
    }

    @Autowired
    private RestTemplate restTemplate;

    @Autowired
    private RedisService redisService;

    public WeatherResponse getWeather(String city) {
        String key = CACHE_KEY_PREFIX + city;
        WeatherResponse cached = redisService.get(key, WeatherResponse.class);
        if (cached != null) {
            return cached;
        }

        try {
            String url = String.format(API, apiKey, city);
            ResponseEntity<WeatherResponse> response = restTemplate.exchange(url, HttpMethod.GET, null, WeatherResponse.class);
            WeatherResponse body = response.getBody();
            if (body != null) {
                redisService.set(key, body, CACHE_TTL_SECONDS);
            }
            return body;
        } catch (HttpClientErrorException.TooManyRequests e) {
            log.warn("Weather API rate limit (429) for city {}: {}", city, e.getMessage());
            return null;
        } catch (HttpClientErrorException e) {
            log.warn("Weather API error {} for city {}: {}", e.getStatusCode(), city, e.getMessage());
            return null;
        } catch (Exception e) {
            log.warn("Weather API request failed for city {}: {}", city, e.getMessage());
            return null;
        }
    }


     /*
    // Example POST call using RestTemplate (commented out)
    HttpHeaders headers = new HttpHeaders();
    headers.setContentType(MediaType.APPLICATION_JSON);

    // If the API expects a body, construct it here (example: a Map or POJO)
    Map<String, String> requestBody = new HashMap<>();
    requestBody.put("city", city);
    requestBody.put("apiKey", apiKey);

    HttpEntity<Map<String, String>> requestEntity = new HttpEntity<>(requestBody, headers);

    ResponseEntity<WeatherResponse> postResponse = restTemplate.exchange(finalAPI, HttpMethod.POST, requestEntity, WeatherResponse.class);
    WeatherResponse postBody = postResponse.getBody();
    // return postBody; // Uncomment if you want to use POST instead of GET
    */
}
