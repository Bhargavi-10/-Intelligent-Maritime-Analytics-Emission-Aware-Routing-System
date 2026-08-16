package com.example.ShipDataSetAnalysis;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ShipDataRepository extends JpaRepository<ShipData, Long> {

    //  Count distinct ships
    @Query("SELECT COUNT(DISTINCT s.shipId) FROM ShipData s")
    long countDistinctShips();

    // Averages
    @Query("SELECT AVG(s.distance) FROM ShipData s")
    Double avgDistance();

    @Query("SELECT AVG(s.fuelConsumption) FROM ShipData s")
    Double avgFuel();

    @Query("SELECT AVG(s.co2Emissions) FROM ShipData s")
    Double avgCO2();

    // DTO Projection (IMPORTANT)
    @Query("SELECT new com.example.ShipDataSetAnalysis.ShipStatsDTO(" +
            "s.shipId, AVG(s.distance), AVG(s.fuelConsumption), AVG(s.co2Emissions)) " +
            "FROM ShipData s GROUP BY s.shipId")
    List<ShipStatsDTO> getShipStats();

    // Chart: Ship Type
    @Query("SELECT s.shipType, AVG(s.distance) FROM ShipData s GROUP BY s.shipType")
    List<Object[]> groupByShipType();

    // Chart: Weather
    @Query("SELECT s.weatherConditions, AVG(s.fuelConsumption) FROM ShipData s GROUP BY s.weatherConditions")
    List<Object[]> groupByWeather();

    @Query("SELECT s.shipMonth, AVG(s.fuelConsumption) FROM ShipData s GROUP BY s.shipMonth")
    List<Object[]> groupByMonth();


        // Monthly trends: average fuel consumption per month
        @Query("SELECT s.shipMonth, AVG(s.fuelConsumption) FROM ShipData s GROUP BY s.shipMonth ORDER BY s.shipMonth")
        List<Object[]> avgFuelByMonth();

        // Monthly trends: average CO2 emissions per month
        @Query("SELECT s.shipMonth, AVG(s.co2Emissions) FROM ShipData s GROUP BY s.shipMonth ORDER BY s.shipMonth")
        List<Object[]> avgCO2ByMonth();

        // Seasonal variation: distance per month
        @Query("SELECT s.shipMonth, AVG(s.distance) FROM ShipData s GROUP BY s.shipMonth ORDER BY s.shipMonth")
        List<Object[]> avgDistanceByMonth();

        // Weather vs fuel consumption
        @Query("SELECT s.weatherConditions, AVG(s.fuelConsumption) FROM ShipData s GROUP BY s.weatherConditions")
        List<Object[]> fuelByWeather();

        // Weather vs CO2 emissions
        @Query("SELECT s.weatherConditions, AVG(s.co2Emissions) FROM ShipData s GROUP BY s.weatherConditions")
        List<Object[]> co2ByWeather();

        // Engine efficiency distribution
        @Query("SELECT s.engineEfficiency FROM ShipData s")
        List<Double> efficiencyValues();

        // Efficiency vs fuel consumption
        @Query("SELECT s.engineEfficiency, AVG(s.fuelConsumption) FROM ShipData s GROUP BY s.engineEfficiency")
        List<Object[]> efficiencyVsFuel();

        // Efficiency vs CO2 emissions
        @Query("SELECT s.engineEfficiency, AVG(s.co2Emissions) FROM ShipData s GROUP BY s.engineEfficiency")
        List<Object[]> efficiencyVsCO2();

        // Donut chart: distribution of ship types
        @Query("SELECT s.shipType, COUNT(s) FROM ShipData s GROUP BY s.shipType")
        List<Object[]> shipTypeDistribution();

        // Donut chart: distribution of weather conditions
        @Query("SELECT s.weatherConditions, COUNT(s) FROM ShipData s GROUP BY s.weatherConditions")
        List<Object[]> weatherDistribution();

        // Donut chart: distribution of routes
        @Query("SELECT s.routeId, COUNT(s) FROM ShipData s GROUP BY s.routeId")
        List<Object[]> routeDistribution();

        // Heatmap: route vs month average fuel consumption
        @Query("SELECT s.routeId, s.shipMonth, AVG(s.fuelConsumption) FROM ShipData s GROUP BY s.routeId, s.shipMonth")
        List<Object[]> fuelByRouteMonth();



}