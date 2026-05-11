import { apiService } from "./api";

class InspectionAPI {
  // Get all inspections
  async getAll(params = {}) {
    // TODO: Uncomment when API is ready
    // try {
    //   const response = await apiService.get("/inspections", params);
    //   return response.data || [];
    // } catch (error) {
    //   console.error("Error fetching inspections:", error);
    //   return this.getMockInspections();
    // }

    // For now, return mock data only (UI development)
    return this.getMockInspections();
  }

  // Get single inspection by ID
  async getById(id) {
    try {
      const response = await apiService.get(`/inspections/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching inspection:", error);
      throw error;
    }
  }

  // Create new inspection
  async create(data) {
    try {
      const response = await apiService.post("/inspections", data);
      return response.data;
    } catch (error) {
      console.error("Error creating inspection:", error);
      throw error;
    }
  }

  // Update inspection
  async update(id, data) {
    try {
      const response = await apiService.put(`/inspections/${id}`, data);
      return response.data;
    } catch (error) {
      console.error("Error updating inspection:", error);
      throw error;
    }
  }

  // Delete inspection
  async delete(id) {
    try {
      await apiService.delete(`/inspections/${id}`);
      return true;
    } catch (error) {
      console.error("Error deleting inspection:", error);
      throw error;
    }
  }

  // Submit inspection
  async submit(id, data) {
    try {
      const response = await apiService.post(`/inspections/${id}/submit`, data);
      return response.data;
    } catch (error) {
      console.error("Error submitting inspection:", error);
      throw error;
    }
  }

  // Get inspection statistics
  async getStats() {
    try {
      const response = await apiService.get("/inspections/stats");
      return response.data;
    } catch (error) {
      console.error("Error fetching stats:", error);
      return {
        total: 0,
        pending: 0,
        completed: 0,
      };
    }
  }

  // Mock data for development - Car Inspections
  getMockInspections() {
    return [
      {
        id: "1",
        carModel: "Toyota Camry 2022",
        carNumber: "MH-12-AB-1234",
        ownerName: "Rajesh Kumar",
        location: "Andheri West, Mumbai",
        date: "2026-05-09",
        time: "10:00 AM",
        status: "pending",
        inspectionType: "Consultant",
      },
      {
        id: "2",
        carModel: "Honda City 2021",
        carNumber: "DL-8C-XY-5678",
        ownerName: "Priya Sharma",
        location: "Connaught Place, Delhi",
        date: "2026-05-08",
        time: "02:30 PM",
        status: "completed",
        inspectionType: "Seller",
      },
      {
        id: "3",
        carModel: "Maruti Swift 2020",
        carNumber: "KA-01-MN-9012",
        ownerName: "Amit Patel",
        location: "Koramangala, Bangalore",
        date: "2026-05-08",
        time: "11:00 AM",
        status: "pending",
        inspectionType: "Buyer",
      },
      {
        id: "4",
        carModel: "Hyundai Creta 2023",
        carNumber: "GJ-05-PQ-3456",
        ownerName: "Sneha Desai",
        location: "Satellite, Ahmedabad",
        date: "2026-05-07",
        time: "09:00 AM",
        status: "rejected",
        inspectionType: "Consultant",
        rejectionReason: "Customer not available",
      },
      {
        id: "5",
        carModel: "Tata Nexon EV 2022",
        carNumber: "MH-02-CD-7890",
        ownerName: "Vikram Singh",
        location: "Bandra East, Mumbai",
        date: "2026-05-06",
        time: "03:00 PM",
        status: "completed",
        inspectionType: "Seller",
      },
      {
        id: "6",
        carModel: "Mahindra XUV700 2023",
        carNumber: "RJ-14-EF-2345",
        ownerName: "Anjali Verma",
        location: "Malviya Nagar, Jaipur",
        date: "2026-05-06",
        time: "01:00 PM",
        status: "rejected",
        inspectionType: "Buyer",
        rejectionReason: "Documents incomplete",
      },
      {
        id: "7",
        carModel: "Kia Seltos 2021",
        carNumber: "TN-09-GH-6789",
        ownerName: "Suresh Reddy",
        location: "T Nagar, Chennai",
        date: "2026-05-10",
        time: "11:30 AM",
        status: "pending",
        inspectionType: "Consultant",
      },
      {
        id: "8",
        carModel: "BMW 3 Series 2022",
        carNumber: "MH-01-XY-4567",
        ownerName: "Arjun Mehta",
        location: "Powai, Mumbai",
        date: "2026-05-11",
        time: "10:30 AM",
        status: "ongoing",
        inspectionType: "Buyer",
      },
      {
        id: "9",
        carModel: "Audi A4 2023",
        carNumber: "DL-3C-AB-8901",
        ownerName: "Neha Kapoor",
        location: "Vasant Vihar, Delhi",
        date: "2026-05-11",
        time: "02:00 PM",
        status: "ongoing",
        inspectionType: "Consultant",
      },
    ];
  }
}

export const inspectionAPI = new InspectionAPI();
