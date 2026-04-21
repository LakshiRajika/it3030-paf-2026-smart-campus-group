package com.smartcampus.dto.response;

import java.util.Map;

public class BookingAnalyticsResponse {
    private long totalBookings;
    private Map<String, Long> statusDistribution;
    private Map<String, Long> resourceUtilization;
    private Map<Integer, Long> hourlyDistribution;
    private double approvalRate;
    private double checkInRate;

    // Getters and Setters
    public long getTotalBookings() { return totalBookings; }
    public void setTotalBookings(long totalBookings) { this.totalBookings = totalBookings; }

    public Map<String, Long> getStatusDistribution() { return statusDistribution; }
    public void setStatusDistribution(Map<String, Long> statusDistribution) { this.statusDistribution = statusDistribution; }

    public Map<String, Long> getResourceUtilization() { return resourceUtilization; }
    public void setResourceUtilization(Map<String, Long> resourceUtilization) { this.resourceUtilization = resourceUtilization; }

    public Map<Integer, Long> getHourlyDistribution() { return hourlyDistribution; }
    public void setHourlyDistribution(Map<Integer, Long> hourlyDistribution) { this.hourlyDistribution = hourlyDistribution; }

    public double getApprovalRate() { return approvalRate; }
    public void setApprovalRate(double approvalRate) { this.approvalRate = approvalRate; }

    public double getCheckInRate() { return checkInRate; }
    public void setCheckInRate(double checkInRate) { this.checkInRate = checkInRate; }
}
