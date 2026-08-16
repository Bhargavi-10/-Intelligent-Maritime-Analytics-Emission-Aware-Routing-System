package com.example.ShipDataSetAnalysis;

public class ShipStatsDTO {
    private String shipId;
    private Double avgDistance;
    private Double avgFuelConsumption;
    private Double avgCO2;

    public ShipStatsDTO(String shipId, Double avgDistance, Double avgFuelConsumption, Double avgCO2) {
        this.shipId = shipId;
        this.avgDistance = avgDistance;
        this.avgFuelConsumption = avgFuelConsumption;
        this.avgCO2 = avgCO2;
    }

    public String getShipId() {
        return shipId;
    }

    public void setShipId(String shipId) {
        this.shipId = shipId;
    }

    public Double getAvgDistance() {
        return avgDistance;
    }

    public void setAvgDistance(Double avgDistance) {
        this.avgDistance = avgDistance;
    }

    public Double getAvgFuelConsumption() {
        return avgFuelConsumption;
    }

    public void setAvgFuelConsumption(Double avgFuelConsumption) {
        this.avgFuelConsumption = avgFuelConsumption;
    }

    public Double getAvgCO2() {
        return avgCO2;
    }

    public void setAvgCO2(Double avgCO2) {
        this.avgCO2 = avgCO2;
    }
}
