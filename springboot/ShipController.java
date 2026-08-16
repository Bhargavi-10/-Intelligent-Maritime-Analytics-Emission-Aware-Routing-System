package com.example.ShipDataSetAnalysis;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api")
public class ShipController {
    @Autowired
    private FastApiService fastApiService;

    @PostMapping("/predict")
    public Double predict(@RequestBody Map<String,Object> input){
        return fastApiService.predictCost(input);
    }

    @PostMapping("/optimize")
    public Object optimize(@RequestBody Map<String, Object> input) {
        return fastApiService.optimizeRoutes(input);
    }
}
