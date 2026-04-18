package com.smartcampus.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartcampus.dto.request.BookingRequest;
import com.smartcampus.dto.request.BookingStatusUpdateRequest;
import com.smartcampus.dto.response.BookingResponse;
import com.smartcampus.model.enums.BookingStatus;
import com.smartcampus.service.BookingService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(BookingController.class)
class BookingControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private BookingService bookingService;

    private BookingResponse sampleResponse;

    @BeforeEach
    void setUp() {
        sampleResponse = new BookingResponse();
        sampleResponse.setId("booking-1");
        sampleResponse.setResourceId("resource-1");
        sampleResponse.setResourceName("Lab 101");
        sampleResponse.setResourceLocation("Block A");
        sampleResponse.setDate(LocalDate.now().plusDays(1));
        sampleResponse.setStartTime(LocalTime.of(9, 0));
        sampleResponse.setEndTime(LocalTime.of(11, 0));
        sampleResponse.setPurpose("Team meeting");
        sampleResponse.setExpectedAttendees(10);
        sampleResponse.setStatus(BookingStatus.PENDING);
        sampleResponse.setUserId("user-1");
        sampleResponse.setUserName("Test User");
        sampleResponse.setUserEmail("test@test.com");
    }

    // ─── POST /api/bookings ──────────────────────────────────────────────────────

    @Test
    @WithMockUser(roles = "USER")
    void createBooking_Returns201_WithValidRequest() throws Exception {
        BookingRequest request = new BookingRequest();
        request.setResourceId("resource-1");
        request.setDate(LocalDate.now().plusDays(1));
        request.setStartTime(LocalTime.of(9, 0));
        request.setEndTime(LocalTime.of(11, 0));
        request.setPurpose("Team meeting");
        request.setExpectedAttendees(10);

        Mockito.when(bookingService.createBooking(any(), any())).thenReturn(sampleResponse);

        mockMvc.perform(post("/api/bookings")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value("booking-1"))
                .andExpect(jsonPath("$.status").value("PENDING"))
                .andExpect(jsonPath("$.resourceName").value("Lab 101"));
    }

    @Test
    @WithMockUser(roles = "USER")
    void createBooking_Returns400_WhenPurposeTooShort() throws Exception {
        BookingRequest request = new BookingRequest();
        request.setResourceId("resource-1");
        request.setDate(LocalDate.now().plusDays(1));
        request.setStartTime(LocalTime.of(9, 0));
        request.setEndTime(LocalTime.of(11, 0));
        request.setPurpose("Hi"); // too short (< 5 chars)

        mockMvc.perform(post("/api/bookings")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void createBooking_Returns401_WhenUnauthenticated() throws Exception {
        BookingRequest request = new BookingRequest();
        request.setResourceId("resource-1");
        request.setDate(LocalDate.now().plusDays(1));
        request.setStartTime(LocalTime.of(9, 0));
        request.setEndTime(LocalTime.of(11, 0));
        request.setPurpose("Team meeting");

        mockMvc.perform(post("/api/bookings")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized());
    }

    // ─── GET /api/bookings/my ────────────────────────────────────────────────────

    @Test
    @WithMockUser(roles = "USER")
    void getMyBookings_Returns200_WithList() throws Exception {
        Mockito.when(bookingService.getMyBookings(any())).thenReturn(List.of(sampleResponse));

        mockMvc.perform(get("/api/bookings/my"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value("booking-1"))
                .andExpect(jsonPath("$[0].status").value("PENDING"));
    }

    @Test
    @WithMockUser(roles = "USER")
    void getMyBookings_WithStatusFilter_Returns200() throws Exception {
        Mockito.when(bookingService.getMyBookingsByStatus(any(), eq(BookingStatus.PENDING)))
                .thenReturn(List.of(sampleResponse));

        mockMvc.perform(get("/api/bookings/my").param("status", "PENDING"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].status").value("PENDING"));
    }

    // ─── GET /api/bookings/{id} ──────────────────────────────────────────────────

    @Test
    @WithMockUser(roles = "USER")
    void getBookingById_Returns200() throws Exception {
        Mockito.when(bookingService.getBookingById(eq("booking-1"), any(), anyBoolean()))
                .thenReturn(sampleResponse);

        mockMvc.perform(get("/api/bookings/booking-1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("booking-1"));
    }

    // ─── PATCH /api/bookings/{id}/cancel ────────────────────────────────────────

    @Test
    @WithMockUser(roles = "USER")
    void cancelBooking_Returns200() throws Exception {
        sampleResponse.setStatus(BookingStatus.CANCELLED);
        Mockito.when(bookingService.cancelBooking(eq("booking-1"), any()))
                .thenReturn(sampleResponse);

        mockMvc.perform(patch("/api/bookings/booking-1/cancel").with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("CANCELLED"));
    }

    // ─── GET /api/bookings (admin) ───────────────────────────────────────────────

    @Test
    @WithMockUser(roles = "ADMIN")
    void getAllBookings_ReturnsListForAdmin() throws Exception {
        Mockito.when(bookingService.getAllBookings()).thenReturn(List.of(sampleResponse));

        mockMvc.perform(get("/api/bookings"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value("booking-1"));
    }

    @Test
    @WithMockUser(roles = "USER")
    void getAllBookings_Returns403_ForNonAdmin() throws Exception {
        mockMvc.perform(get("/api/bookings"))
                .andExpect(status().isForbidden());
    }

    // ─── PATCH /api/bookings/{id}/status (admin) ─────────────────────────────────

    @Test
    @WithMockUser(roles = "ADMIN")
    void updateBookingStatus_Approve_Returns200() throws Exception {
        sampleResponse.setStatus(BookingStatus.APPROVED);
        Mockito.when(bookingService.updateBookingStatus(eq("booking-1"), any(), any()))
                .thenReturn(sampleResponse);

        BookingStatusUpdateRequest req = new BookingStatusUpdateRequest();
        req.setStatus(BookingStatus.APPROVED);

        mockMvc.perform(patch("/api/bookings/booking-1/status")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("APPROVED"));
    }

    @Test
    @WithMockUser(roles = "USER")
    void updateBookingStatus_Returns403_ForNonAdmin() throws Exception {
        BookingStatusUpdateRequest req = new BookingStatusUpdateRequest();
        req.setStatus(BookingStatus.APPROVED);

        mockMvc.perform(patch("/api/bookings/booking-1/status")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isForbidden());
    }

    // ─── GET /api/bookings/check-conflict ────────────────────────────────────────

    @Test
    @WithMockUser(roles = "USER")
    void checkConflict_ReturnsAvailable_WhenNoConflict() throws Exception {
        Mockito.when(bookingService.hasConflict(any(), any(), any(), any(), any()))
                .thenReturn(false);

        mockMvc.perform(get("/api/bookings/check-conflict")
                        .param("resourceId", "resource-1")
                        .param("date", LocalDate.now().plusDays(1).toString())
                        .param("startTime", "09:00")
                        .param("endTime", "11:00"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.hasConflict").value(false))
                .andExpect(jsonPath("$.available").value(true));
    }

    @Test
    @WithMockUser(roles = "USER")
    void checkConflict_ReturnsConflict_WhenSlotTaken() throws Exception {
        Mockito.when(bookingService.hasConflict(any(), any(), any(), any(), any()))
                .thenReturn(true);

        mockMvc.perform(get("/api/bookings/check-conflict")
                        .param("resourceId", "resource-1")
                        .param("date", LocalDate.now().plusDays(1).toString())
                        .param("startTime", "09:00")
                        .param("endTime", "11:00"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.hasConflict").value(true))
                .andExpect(jsonPath("$.available").value(false));
    }
}