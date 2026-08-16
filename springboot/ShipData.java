package com.example.ShipDataSetAnalysis;

import jakarta.persistence.*;

@Entity
@Table(name="ship_data")
public class ShipData {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "ship_id")
    private String shipId;
    @Column(name = "ship_type")
    private String shipType;
    @Column(name = "route_id")
    private String routeId;
    @Column(name = "month")
    private String shipMonth;
    @Column(name = "distance")
    private Double distance;
    @Column(name = "fuel_type")
    private String fuelType;
    @Column(name = "fuel_consumption")
    private Double fuelConsumption;
    @Column(name = "co2_emissions")
    private Double co2Emissions;
    @Column(name = "weather_conditions")
    private String weatherConditions;
    @Column(name = "engine_efficiency")
    private Double engineEfficiency;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getShipId() {
        return shipId;
    }

    public void setShipId(String shipId) {
        this.shipId = shipId;
    }

    public String getRouteId() {
        return routeId;
    }

    public void setRouteId(String routeId) {
        this.routeId = routeId;
    }

    public String getShipType() {
        return shipType;
    }

    public void setShipType(String shipType) {
        this.shipType = shipType;
    }

    public String getShipMonth() {
        return shipMonth;
    }

    public void setShipMonth(String month) {
        this.shipMonth = month;
    }

    public Double getDistance() {
        return distance;
    }

    public void setDistance(Double distance) {
        this.distance = distance;
    }

    public String getFuelType() {
        return fuelType;
    }

    public void setFuelType(String fuelType) {
        this.fuelType = fuelType;
    }

    public Double getFuelConsumption() {
        return fuelConsumption;
    }

    public void setFuelConsumption(Double fuelConsumption) {
        this.fuelConsumption = fuelConsumption;
    }

    public Double getCo2Emissions() {
        return co2Emissions;
    }

    public void setCo2Emissions(Double co2Emissions) {
        this.co2Emissions = co2Emissions;
    }

    public String getWeatherConditions() {
        return weatherConditions;
    }

    public void setWeatherConditions(String weatherConditions) {
        this.weatherConditions = weatherConditions;
    }

    public Double getEngineEfficiency() {
        return engineEfficiency;
    }

    public void setEngineEfficiency(Double engineEfficiency) {
        this.engineEfficiency = engineEfficiency;
    }
}
