package com.example.ShipDataSetAnalysis;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Service
public class FastApiService {

    private final String BASE_URL = "http://localhost:8000"  ;//fast api url

    @Autowired
    private RestTemplate restTemplate;

    public Double predictCost(Map<String, Object> inputData) {
        String url = BASE_URL + "/predict";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(inputData, headers);

        Map<String, Object> response = restTemplate.postForObject(url, request, Map.class);

        return (Double) response.get("predicted_cost");
    }

    public Object optimizeRoutes(Map<String, Object> inputData) {
        String url = BASE_URL + "/optimize";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        // Wrap input in "ships" key if not already
        Map<String, Object> requestBody = new HashMap<>();
        if (!inputData.containsKey("ships")) {
            requestBody.put("ships", inputData.get("ships")); // expects inputData to have "ships" key
        } else {
            requestBody = inputData;
        }

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);

        Map<String, Object> response = restTemplate.postForObject(url, request, Map.class);

        if (response != null && response.containsKey("best_routes")) {
            return response.get("best_routes");
        } else {
            throw new RuntimeException("Invalid response from FastAPI /optimize: " + response);
        }
    }

}
