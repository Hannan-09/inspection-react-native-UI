import { apiService } from "./api";

class InspectionAPI {
  // Get all inspections
  async getAll(params = {}) {
    try {
      const response = await apiService.get("/inspections", params);
      return response.data || [];
    } catch (error) {
      console.error("Error fetching inspections:", error);
      // Return mock data for development
      return this.getMockInspections();
    }
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

  // Mock data for development
  getMockInspections() {
    return [
      {
        id: "1",
        title: "Building A - Floor 1",
        location: "Main Street, Building A",
        date: "2026-05-08",
        status: "pending",
      },
      {
        id: "2",
        title: "Building B - Roof",
        location: "Main Street, Building B",
        date: "2026-05-07",
        status: "completed",
      },
      {
        id: "3",
        title: "Warehouse Inspection",
        location: "Industrial Area",
        date: "2026-05-06",
        status: "pending",
      },
    ];
  }
}

export const inspectionAPI = new InspectionAPI();
