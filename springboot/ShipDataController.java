package com.example.ShipDataSetAnalysis;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/ships")
@CrossOrigin
public class ShipDataController {

    @Autowired
    private ShipDataService service;

    //  Full dataset
    @GetMapping
    public List<ShipData> getAllShips() {
        return service.getAllShips();
    }

    //  Total ships
    @GetMapping("/count")
    public long getShipCount() {
        return service.getShipCount();
    }

    //  Averages
    @GetMapping("/averages")
    public Map<String, Double> getAverages() {
        return service.getAverages();
    }

    //  DTO stats (IMPORTANT)
    @GetMapping("/stats")
    public List<ShipStatsDTO> getShipStats() {
        return service.getShipStats();
    }

    //  Chart data
    @GetMapping("/by-type")
    public List<Object[]> getByShipType() {
        return service.getByShipType();
    }

    @GetMapping("/by-weather")
    public List<Object[]> getByWeather() {
        return service.getByWeather();
    }


    // 📊 Time & Trend Analysis
    @GetMapping("/fuel-by-month") public List<Object[]> fuelByMonth() { return service.getAvgFuelByMonth(); }
    @GetMapping("/co2-by-month") public List<Object[]> co2ByMonth() { return service.getAvgCO2ByMonth(); }
    @GetMapping("/distance-by-month") public List<Object[]> distanceByMonth() { return service.getAvgDistanceByMonth(); }

    // 🌦 Weather Impact
    @GetMapping("/fuel-by-weather") public List<Object[]> fuelByWeather() { return service.getFuelByWeather(); }
    @GetMapping("/co2-by-weather") public List<Object[]> co2ByWeather() { return service.getCO2ByWeather(); }

    // 🔧 Efficiency & Performance
    @GetMapping("/efficiency-values") public List<Double> efficiencyValues() { return service.getEfficiencyValues(); }
    @GetMapping("/efficiency-vs-fuel") public List<Object[]> efficiencyVsFuel() { return service.getEfficiencyVsFuel(); }
    @GetMapping("/efficiency-vs-co2") public List<Object[]> efficiencyVsCO2() { return service.getEfficiencyVsCO2(); }

    // 📊 Donut Charts
    @GetMapping("/ship-type-distribution") public List<Object[]> shipTypeDistribution() { return service.getShipTypeDistribution(); }
    @GetMapping("/weather-distribution") public List<Object[]> weatherDistribution() { return service.getWeatherDistribution(); }
    @GetMapping("/route-distribution") public List<Object[]> routeDistribution() { return service.getRouteDistribution(); }

    // 🔥 Heatmap
    @GetMapping("/fuel-by-route-month") public List<Object[]> fuelByRouteMonth() { return service.getFuelByRouteMonth(); }

}