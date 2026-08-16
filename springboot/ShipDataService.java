package com.example.ShipDataSetAnalysis;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class ShipDataService {

    @Autowired
    private ShipDataRepository repo;

    public List<ShipData> getAllShips() {
        return repo.findAll();
    }

    public long getShipCount() {
        return repo.countDistinctShips();
    }

    public Map<String, Double> getAverages() {
        Map<String, Double> map = new HashMap<>();
        map.put("distance", repo.avgDistance());
        map.put("fuel", repo.avgFuel());
        map.put("co2", repo.avgCO2());
        return map;
    }

    public List<ShipStatsDTO> getShipStats() {
        return repo.getShipStats();
    }

    public List<Object[]> getByShipType() {
        return repo.groupByShipType();
    }

    public List<Object[]> getByWeather() {
        return repo.groupByWeather();
    }

        public List<Object[]> getAvgFuelByMonth() { return repo.avgFuelByMonth(); }
        public List<Object[]> getAvgCO2ByMonth() { return repo.avgCO2ByMonth(); }
        public List<Object[]> getAvgDistanceByMonth() { return repo.avgDistanceByMonth(); }

        public List<Object[]> getFuelByWeather() { return repo.fuelByWeather(); }
        public List<Object[]> getCO2ByWeather() { return repo.co2ByWeather(); }

        public List<Double> getEfficiencyValues() { return repo.efficiencyValues(); }
        public List<Object[]> getEfficiencyVsFuel() { return repo.efficiencyVsFuel(); }
        public List<Object[]> getEfficiencyVsCO2() { return repo.efficiencyVsCO2(); }

        public List<Object[]> getShipTypeDistribution() { return repo.shipTypeDistribution(); }
        public List<Object[]> getWeatherDistribution() { return repo.weatherDistribution(); }
        public List<Object[]> getRouteDistribution() { return repo.routeDistribution(); }

        public List<Object[]> getFuelByRouteMonth() { return repo.fuelByRouteMonth(); }
}