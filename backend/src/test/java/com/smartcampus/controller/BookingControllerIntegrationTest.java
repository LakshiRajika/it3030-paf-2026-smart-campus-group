package com.smartcampus.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartcampus.dto.request.BookingRequest;
import com.smartcampus.dto.request.BookingStatusUpdateRequest;
import com.smartcampus.dto.response.BookingResponse;
import com.smartcampus.model.User;
import com.smartcampus.model.enums.BookingStatus;
import com.smartcampus.model.enums.UserRole;
import com.smartcampus.security.CustomUserDetails;
import com.smartcampus.security.JwtAuthenticationFilter;
import com.smartcampus.security.OAuth2AuthenticationSuccessHandler;
import com.smartcampus.security.OAuth2UserService;
import com.smartcampus.service.BookingService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.core.MethodParameter;
import org.springframework.http.MediaType;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.bind.support.WebDataBinderFactory;
import org.springframework.web.context.request.NativeWebRequest;
import org.springframework.web.method.support.HandlerMethodArgumentResolver;
import org.springframework.web.method.support.ModelAndViewContainer;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Set;

import static org.mockito.ArgumentMatchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(BookingController.class)
@AutoConfigureMockMvc(addFilters = false)
class BookingControllerIntegrationTest {

    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private BookingService bookingService;

    // Security beans still needed to satisfy context loading but won't be used with addFilters=false
    @MockBean
    private OAuth2UserService oauth2UserService;
    @MockBean
    private OAuth2AuthenticationSuccessHandler oauth2AuthenticationSuccessHandler;
    @MockBean
    private ClientRegistrationRepository clientRegistrationRepository;
    @MockBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Autowired
    private BookingController bookingController;

    private CustomUserDetails userDetails;
    private CustomUserDetails adminDetails;
    private BookingResponse sampleResponse;
    private CustomUserDetails activeUser;

    @BeforeEach
    void setUp() {
        User user = User.builder()
                .id("user-1")
                .email("test@test.com")
                .roles(Set.of(UserRole.USER))
                .build();
        userDetails = new CustomUserDetails(user);

        User admin = User.builder()
                .id("admin-1")
                .email("admin@test.com")
                .roles(Set.of(UserRole.ADMIN))
                .build();
        adminDetails = new CustomUserDetails(admin);

        activeUser = userDetails; // Default

        // Set up MockMvc with a custom argument resolver to inject our activeUser
        mockMvc = MockMvcBuilders.standaloneSetup(bookingController)
                .setCustomArgumentResolvers(new HandlerMethodArgumentResolver() {
                    @Override
                    public boolean supportsParameter(MethodParameter parameter) {
                        return parameter.getParameterType().equals(CustomUserDetails.class);
                    }

                    @Override
                    public Object resolveArgument(MethodParameter parameter, ModelAndViewContainer mavContainer,
                                                  NativeWebRequest webRequest, WebDataBinderFactory binderFactory) {
                        return activeUser;
                    }
                })
                .build();

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
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value("booking-1"))
                .andExpect(jsonPath("$.status").value("PENDING"));
    }

    @Test
    void createBooking_Returns400_WhenPurposeTooShort() throws Exception {
        BookingRequest request = new BookingRequest();
        request.setResourceId("resource-1");
        request.setPurpose("Hi");

        mockMvc.perform(post("/api/bookings")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    // ─── GET /api/bookings/my ────────────────────────────────────────────────────

    @Test
    void getMyBookings_Returns200_WithList() throws Exception {
        Mockito.when(bookingService.getMyBookings(any())).thenReturn(List.of(sampleResponse));

        mockMvc.perform(get("/api/bookings/my"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value("booking-1"));
    }

    @Test
    void getMyBookings_WithStatusFilter_Returns200() throws Exception {
        Mockito.when(bookingService.getMyBookingsByStatus(any(), eq(BookingStatus.PENDING)))
                .thenReturn(List.of(sampleResponse));

        mockMvc.perform(get("/api/bookings/my").param("status", "PENDING"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].status").value("PENDING"));
    }

    // ─── GET /api/bookings/{id} ──────────────────────────────────────────────────

    @Test
    void getBookingById_Returns200() throws Exception {
        Mockito.when(bookingService.getBookingById(eq("booking-1"), any(), anyBoolean()))
                .thenReturn(sampleResponse);

        mockMvc.perform(get("/api/bookings/booking-1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("booking-1"));
    }

    // ─── PATCH /api/bookings/{id}/cancel ────────────────────────────────────────

    @Test
    void cancelBooking_Returns200() throws Exception {
        sampleResponse.setStatus(BookingStatus.CANCELLED);
        Mockito.when(bookingService.cancelBooking(eq("booking-1"), any()))
                .thenReturn(sampleResponse);

        mockMvc.perform(patch("/api/bookings/booking-1/cancel"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("CANCELLED"));
    }

    // ─── GET /api/bookings (admin) ───────────────────────────────────────────────

    @Test
    void getAllBookings_ReturnsListForAdmin() throws Exception {
        activeUser = adminDetails;
        Mockito.when(bookingService.getAllBookings()).thenReturn(List.of(sampleResponse));

        mockMvc.perform(get("/api/bookings"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value("booking-1"));
    }

    // ─── PATCH /api/bookings/{id}/status (admin) ─────────────────────────────────

    @Test
    void updateBookingStatus_Approve_Returns200() throws Exception {
        activeUser = adminDetails;
        sampleResponse.setStatus(BookingStatus.APPROVED);
        Mockito.when(bookingService.updateBookingStatus(eq("booking-1"), any(), any()))
                .thenReturn(sampleResponse);

        BookingStatusUpdateRequest req = new BookingStatusUpdateRequest();
        req.setStatus(BookingStatus.APPROVED);

        mockMvc.perform(patch("/api/bookings/booking-1/status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("APPROVED"));
    }

    // ─── GET /api/bookings/check-conflict ────────────────────────────────────────

    @Test
    void checkConflict_ReturnsAvailable_WhenNoConflict() throws Exception {
        Mockito.when(bookingService.hasConflict(any(), any(), any(), any(), any()))
                .thenReturn(false);

        mockMvc.perform(get("/api/bookings/check-conflict")
                        .param("resourceId", "resource-1")
                        .param("date", LocalDate.now().plusDays(1).toString())
                        .param("startTime", "09:00")
                        .param("endTime", "11:00"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.hasConflict").value(false));
    }

    @Test
    void checkConflict_ReturnsConflict_WhenSlotTaken() throws Exception {
        Mockito.when(bookingService.hasConflict(any(), any(), any(), any(), any()))
                .thenReturn(true);

        mockMvc.perform(get("/api/bookings/check-conflict")
                        .param("resourceId", "resource-1")
                        .param("date", LocalDate.now().plusDays(1).toString())
                        .param("startTime", "09:00")
                        .param("endTime", "11:00"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.hasConflict").value(true));
    }
}