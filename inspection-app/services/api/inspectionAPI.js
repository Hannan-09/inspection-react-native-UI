import { apiService } from "./api";
import { API_CONFIG } from "../../config/api.config";

class InspectionAPI {
  // Get inspections assigned to the inspector
  async getAssignedInspections(pageNo = 1, size = 10, assignmentStatus = "") {
    try {
      const params = { pageNo, size };
      if (assignmentStatus) {
        params.assignmentStatus = assignmentStatus;
      }

      const response = await apiService.get(API_CONFIG.ENDPOINTS.INSPECTIONS.ASSIGNED_LIST, params);
      return response; // Return full response including pageResponse
    } catch (error) {
      console.error("Error fetching assigned inspections:", error);
      throw error;
    }
  }

  // Get single assigned inspection by ID
  async getAssignedInspectionById(id) {
    try {
      const endpoint = API_CONFIG.ENDPOINTS.INSPECTIONS.ASSIGNED_DETAILS.replace(":id", id);
      const response = await apiService.get(endpoint);
      console.log('assigned&&&', response);
      return response.data || response;
    } catch (error) {
      console.error("Error fetching assigned inspection details:", error);
      throw error;
    }
  }

  // Accept an assigned inspection
  async acceptAssignment(id) {
    try {
      const endpoint = API_CONFIG.ENDPOINTS.INSPECTIONS.ACCEPT.replace(":id", id);
      const response = await apiService.put(endpoint);
      return response.data || response;
    } catch (error) {
      console.error("Error accepting assignment:", error);
      throw error;
    }
  }

  // Start an inspection
  async startInspection(id) {
    try {
      const endpoint = API_CONFIG.ENDPOINTS.INSPECTIONS.START.replace(":id", id);
      const response = await apiService.post(endpoint);
      return response.data || response;
    } catch (error) {
      console.error("Error starting inspection:", error);
      throw error;
    }
  }

  // Save Section 1: Engine & Powertrain
  async saveSectionEngine(id, data) {
    try {
      const endpoint = API_CONFIG.ENDPOINTS.INSPECTIONS.SECTION_ENGINE.replace(":id", id);

      const formData = new FormData();
      Object.keys(data).forEach(key => {
        const value = data[key];
        if (value !== null && value !== undefined) {
          // If value is a local file URI, append as file object
          if (typeof value === "string" && (value.startsWith("file://") || value.startsWith("content://"))) {
            const filename = value.split("/").pop();
            const match = /\.(\w+)$/.exec(filename);
            const type = match ? `${key.toLowerCase().includes("video") ? "video" : "image"}/${match[1]}` : "image/jpeg";

            formData.append(key, {
              uri: value,
              name: filename,
              type: type
            });
          } else {
            formData.append(key, value);
          }
        }
      });

      const response = await apiService.putMultipart(endpoint, formData);
      return response.data || response;
    } catch (error) {
      console.error("Error saving engine section:", error);
      throw error;
    }
  }

  // Save Section 1: EV Battery & Powertrain
  async saveSectionEvBattery(id, data) {
    try {
      const endpoint = API_CONFIG.ENDPOINTS.INSPECTIONS.SECTION_EV_BATTERY.replace(":id", id);

      const formData = new FormData();
      Object.keys(data).forEach(key => {
        const value = data[key];
        if (value !== null && value !== undefined) {
          // If value is a local file URI, append as file object
          if (typeof value === "string" && (value.startsWith("file://") || value.startsWith("content://"))) {
            const filename = value.split("/").pop();
            const match = /\.(\w+)$/.exec(filename);
            const type = match ? `${key.toLowerCase().includes("video") ? "video" : "image"}/${match[1]}` : "image/jpeg";

            formData.append(key, {
              uri: value,
              name: filename,
              type: type
            });
          } else {
            formData.append(key, value);
          }
        }
      });

      const response = await apiService.putMultipart(endpoint, formData);
      return response.data || response;
    } catch (error) {
      console.error("Error saving EV battery section:", error);
      throw error;
    }
  }

  // Save Section 2: Mechanical Components
  async saveSectionMechanical(id, data) {
    try {
      const endpoint = API_CONFIG.ENDPOINTS.INSPECTIONS.SECTION_MECHANICAL.replace(":id", id);

      const formData = new FormData();
      Object.keys(data).forEach(key => {
        const value = data[key];
        if (value !== null && value !== undefined) {
          // If value is a local file URI, append as file object
          if (typeof value === "string" && (value.startsWith("file://") || value.startsWith("content://"))) {
            const filename = value.split("/").pop();
            const match = /\.(\w+)$/.exec(filename);
            const type = match ? `image/${match[1]}` : "image/jpeg";

            formData.append(key, {
              uri: value,
              name: filename,
              type: type
            });
          } else {
            formData.append(key, value);
          }
        }
      });

      const response = await apiService.putMultipart(endpoint, formData);
      return response.data || response;
    } catch (error) {
      console.error("Error saving mechanical section:", error);
      throw error;
    }
  }

  // Save Section 3: Exterior Panels
  async saveSectionExteriorPanels(id, payload) {
    try {
      const endpoint = API_CONFIG.ENDPOINTS.INSPECTIONS.SECTION_EXTERIOR_PANELS.replace(":id", id);
      const formData = new FormData();

      // Map panels to indexed fields for @ModelAttribute
      payload.panels.forEach((panel, index) => {
        formData.append(`panels[${index}].panelName`, panel.panelName);
        formData.append(`panels[${index}].originalPaint`, panel.originalPaint);
        formData.append(`panels[${index}].repainted`, panel.repainted);
        formData.append(`panels[${index}].dentSeverity`, panel.dentSeverity || "NONE");
        formData.append(`panels[${index}].scratchSeverity`, panel.scratchSeverity || "NONE");
        formData.append(`panels[${index}].rustPresent`, panel.rustPresent);
        if (panel.dentPhotoIndices && panel.dentPhotoIndices.length > 0) {
          panel.dentPhotoIndices.forEach(photoIndex => {
            formData.append(`panels[${index}].dentPhotoIndices`, photoIndex);
          });
        }
        if (panel.scratchPhotoIndices && panel.scratchPhotoIndices.length > 0) {
          panel.scratchPhotoIndices.forEach(photoIndex => {
            formData.append(`panels[${index}].scratchPhotoIndices`, photoIndex);
          });
        }
        if (panel.panelPhotoIndices && panel.panelPhotoIndices.length > 0) {
          panel.panelPhotoIndices.forEach(photoIndex => {
            formData.append(`panels[${index}].panelPhotoIndices`, photoIndex);
          });
        }
      });

      // Map photos to the list part
      if (payload.photos && payload.photos.length > 0) {
        payload.photos.forEach((uri) => {
          if (uri && (uri.startsWith("file://") || uri.startsWith("content://"))) {
            const filename = uri.split("/").pop();
            const match = /\.(\w+)$/.exec(filename);
            const type = match ? `image/${match[1]}` : "image/jpeg";
            formData.append("panelPhotos", {
              uri,
              name: filename,
              type: type
            });
          }
        });
      }

      const response = await apiService.putMultipart(endpoint, formData);
      return response.data || response;
    } catch (error) {
      console.error("Error saving exterior panels section:", error);
      throw error;
    }
  }

  // Save Section 4: Glass & Exterior Electronics
  async saveSectionGlassExterior(id, data) {
    try {
      const endpoint = API_CONFIG.ENDPOINTS.INSPECTIONS.SECTION_GLASS_EXTERIOR.replace(":id", id);

      const formData = new FormData();
      Object.keys(data).forEach(key => {
        const value = data[key];
        if (value !== null && value !== undefined) {
          // If value is a local file URI, append as file object
          if (typeof value === "string" && (value.startsWith("file://") || value.startsWith("content://"))) {
            const filename = value.split("/").pop();
            const match = /\.(\w+)$/.exec(filename);
            const type = match ? `image/${match[1]}` : "image/jpeg";

            formData.append(key, {
              uri: value,
              name: filename,
              type: type
            });
          } else {
            formData.append(key, value);
          }
        }
      });

      const response = await apiService.putMultipart(endpoint, formData);
      return response.data || response;
    } catch (error) {
      console.error("Error saving glass exterior section:", error);
      throw error;
    }
  }

  // Save Section 5: Interior & Cabin
  async saveSectionInteriorCabin(id, data) {
    try {
      const endpoint = API_CONFIG.ENDPOINTS.INSPECTIONS.SECTION_INTERIOR_CABIN.replace(":id", id);

      const formData = new FormData();
      Object.keys(data).forEach(key => {
        const value = data[key];
        if (value !== null && value !== undefined) {
          // If value is a local file URI, append as file object
          if (typeof value === "string" && (value.startsWith("file://") || value.startsWith("content://"))) {
            const filename = value.split("/").pop();
            const match = /\.(\w+)$/.exec(filename);
            const type = match ? `image/${match[1]}` : "image/jpeg";

            formData.append(key, {
              uri: value,
              name: filename,
              type: type
            });
          } else {
            formData.append(key, value);
          }
        }
      });

      const response = await apiService.putMultipart(endpoint, formData);
      return response.data || response;
    } catch (error) {
      console.error("Error saving interior cabin section:", error);
      throw error;
    }
  }

  // Save Section 6: Structural History
  async saveSectionStructuralHistory(id, data) {
    try {
      const endpoint = API_CONFIG.ENDPOINTS.INSPECTIONS.SECTION_STRUCTURAL_HISTORY.replace(":id", id);

      const formData = new FormData();
      Object.keys(data).forEach(key => {
        const value = data[key];
        if (value !== null && value !== undefined) {
          if (Array.isArray(value)) {
            // Handle array of files
            value.forEach(fileUri => {
              if (typeof fileUri === "string" && (fileUri.startsWith("file://") || fileUri.startsWith("content://"))) {
                const filename = fileUri.split("/").pop();
                const match = /\.(\w+)$/.exec(filename);
                const type = match ? `image/${match[1]}` : "image/jpeg";
                formData.append(key, { uri: fileUri, name: filename, type });
              }
            });
          } else if (typeof value === "string" && (value.startsWith("file://") || value.startsWith("content://"))) {
            const filename = value.split("/").pop();
            const match = /\.(\w+)$/.exec(filename);
            const type = match ? `image/${match[1]}` : "image/jpeg";
            formData.append(key, { uri: value, name: filename, type });
          } else {
            formData.append(key, value);
          }
        }
      });

      const response = await apiService.putMultipart(endpoint, formData);
      return response.data || response;
    } catch (error) {
      console.error("Error saving structural history section:", error);
      throw error;
    }
  }

  // Save Section 7: Tyres
  async saveSectionTyres(id, data) {
    try {
      const endpoint = API_CONFIG.ENDPOINTS.INSPECTIONS.SECTION_TYRES.replace(":id", id);

      const formData = new FormData();
      Object.keys(data).forEach(key => {
        const value = data[key];
        if (value !== null && value !== undefined) {
          // If value is a local file URI, append as file object
          if (typeof value === "string" && (value.startsWith("file://") || value.startsWith("content://"))) {
            const filename = value.split("/").pop();
            const match = /\.(\w+)$/.exec(filename);
            const type = match ? `image/${match[1]}` : "image/jpeg";

            formData.append(key, {
              uri: value,
              name: filename,
              type: type
            });
          } else {
            formData.append(key, value);
          }
        }
      });

      const response = await apiService.putMultipart(endpoint, formData);
      return response.data || response;
    } catch (error) {
      console.error("Error saving tyres section:", error);
      throw error;
    }
  }

  // Save Section 8: OBD/Diagnostics
  async saveSectionObd(id, data) {
    try {
      const endpoint = API_CONFIG.ENDPOINTS.INSPECTIONS.SECTION_OBD.replace(":id", id);

      const formData = new FormData();
      Object.keys(data).forEach(key => {
        const value = data[key];
        if (value !== null && value !== undefined) {
          if (typeof value === "string" && (value.startsWith("file://") || value.startsWith("content://"))) {
            const filename = value.split("/").pop();
            const match = /\.(\w+)$/.exec(filename);
            const type = match ? `image/${match[1]}` : "image/jpeg";

            formData.append(key, {
              uri: value,
              name: filename,
              type: type
            });
          } else {
            formData.append(key, value);
          }
        }
      });

      const response = await apiService.putMultipart(endpoint, formData);
      return response.data || response;
    } catch (error) {
      console.error("Error saving OBD section:", error);
      throw error;
    }
  }

  // Save Section 9: Modifications
  async saveSectionModifications(id, payload) {
    try {
      const endpoint = API_CONFIG.ENDPOINTS.INSPECTIONS.SECTION_MODIFICATIONS.replace(":id", id);
      const formData = new FormData();

      // Summary fields
      formData.append("modificationsDetected", payload.modificationsDetected);
      formData.append("modificationCount", payload.modificationCount || 0);
      formData.append("modificationRiskLevel", payload.modificationRiskLevel || "LOW");
      formData.append("sellerDeclarationMatch", payload.sellerDeclarationMatch);

      // Map modification items to indexed fields
      if (payload.modificationItems && payload.modificationItems.length > 0) {
        payload.modificationItems.forEach((item, index) => {
          formData.append(`modificationItems[${index}].modificationCategory`, item.modificationCategory);
          formData.append(`modificationItems[${index}].modificationType`, item.modificationType);
          formData.append(`modificationItems[${index}].isOem`, item.isOem);
          formData.append(`modificationItems[${index}].impactOnWarranty`, item.impactOnWarranty || "NONE");
          formData.append(`modificationItems[${index}].impactOnSafety`, item.impactOnSafety || "NONE");
          formData.append(`modificationItems[${index}].documentationAvailable`, item.documentationAvailable);
          formData.append(`modificationItems[${index}].remarks`, item.remarks || "");
          if (item.photoIndex !== null && item.photoIndex !== undefined) {
            formData.append(`modificationItems[${index}].photoIndex`, item.photoIndex);
          }
        });
      }

      // Map photos to the list part
      if (payload.photos && payload.photos.length > 0) {
        payload.photos.forEach((uri) => {
          if (uri && (uri.startsWith("file://") || uri.startsWith("content://"))) {
            const filename = uri.split("/").pop();
            const match = /\.(\w+)$/.exec(filename);
            const type = match ? `image/${match[1]}` : "image/jpeg";
            formData.append("modificationPhotos", {
              uri,
              name: filename,
              type: type
            });
          }
        });
      }

      const response = await apiService.putMultipart(endpoint, formData);
      return response.data || response;
    } catch (error) {
      console.error("Error saving modifications section:", error);
      throw error;
    }
  }

  // Save Section 10: Media & Documentation
  async saveSectionMedia(id, data) {
    try {
      const endpoint = API_CONFIG.ENDPOINTS.INSPECTIONS.SECTION_MEDIA.replace(":id", id);

      const formData = new FormData();
      Object.keys(data).forEach(key => {
        const value = data[key];
        if (value !== null && value !== undefined) {
          if (Array.isArray(value)) {
            // Handle array of files
            value.forEach(fileUri => {
              if (typeof fileUri === "string" && (fileUri.startsWith("file://") || fileUri.startsWith("content://"))) {
                const filename = fileUri.split("/").pop();
                const match = /\.(\w+)$/.exec(filename);
                const type = match ? `image/${match[1]}` : "image/jpeg";
                formData.append(key, {
                  uri: fileUri,
                  name: filename,
                  type: type
                });
              }
            });
          } else if (typeof value === "string" && (value.startsWith("file://") || value.startsWith("content://"))) {
            // Handle single file
            const filename = value.split("/").pop();
            const match = /\.(\w+)$/.exec(filename);
            const isVideo = key.toLowerCase().includes("video");
            const type = match ? `${isVideo ? "video" : "image"}/${match[1]}` : (isVideo ? "video/mp4" : "image/jpeg");

            formData.append(key, {
              uri: value,
              name: filename,
              type: type
            });
          } else {
            formData.append(key, value);
          }
        }
      });

      const response = await apiService.putMultipart(endpoint, formData);
      return response.data || response;
    } catch (error) {
      console.error("Error saving media section:", error);
      throw error;
    }
  }

  // Save Section 11: Vehicle Documents (4W)
  async saveSectionVehicleDocuments(id, data) {
    console.log("Vehicle Documents Payload:", data);
    try {
      const endpoint = API_CONFIG.ENDPOINTS.INSPECTIONS.SECTION_VEHICLE_DOCUMENTS.replace(":id", id);
      const response = await apiService.put(endpoint, data);
      console.log("Vehicle Documents Response:", response);
      return response.data || response;
    } catch (error) {
      console.error("Error saving vehicle documents section:", error);
      throw error;
    }
  }

  // Save Section 11: Vehicle Specs (Legacy/2W)
  async saveSectionVehicleSpecs(id, data) {
    console.log("payload Data", data);
    try {
      const endpoint = API_CONFIG.ENDPOINTS.INSPECTIONS.SECTION_VEHICLE_SPECS.replace(":id", id);
      const response = await apiService.put(endpoint, data);
      console.log("Response Data", response);
      return response.data || response;
    } catch (error) {
      console.error("Error saving vehicle specs section:", error);
      throw error;
    }
  }

  // Final Submit Inspection
  async submitInspection(id) {
    try {
      const endpoint = API_CONFIG.ENDPOINTS.INSPECTIONS.SUBMIT.replace(":id", id);
      const response = await apiService.post(endpoint, {});
      return response.data || response;
    } catch (error) {
      console.error("Error submitting inspection:", error);
      throw error;
    }
  }

  // ==========================================
  // 2-WHEELER SPECIFIC APIs
  // ==========================================

  async startInspection2W(id) {
    try {
      const endpoint = API_CONFIG.ENDPOINTS.INSPECTIONS_2W.START.replace(":id", id);
      const response = await apiService.post(endpoint);
      return response.data || response;
    } catch (error) {
      console.error("Error starting 2W inspection:", error);
      throw error;
    }
  }

  async saveSectionEngine2W(id, data) {
    try {
      const endpoint = API_CONFIG.ENDPOINTS.INSPECTIONS_2W.SECTION_ENGINE.replace(":id", id);
      const formData = new FormData();
      Object.keys(data).forEach(key => {
        const value = data[key];
        if (value !== null && value !== undefined) {
          if (typeof value === "string" && (value.startsWith("file://") || value.startsWith("content://"))) {
            const filename = value.split("/").pop();
            const match = /\.(\w+)$/.exec(filename);
            const type = match ? `${key.toLowerCase().includes("video") ? "video" : "image"}/${match[1]}` : "image/jpeg";
            formData.append(key, { uri: value, name: filename, type });
          } else {
            formData.append(key, value);
          }
        }
      });
      const response = await apiService.putMultipart(endpoint, formData);
      return response.data || response;
    } catch (error) {
      console.error("Error saving 2W engine section:", error);
      throw error;
    }
  }

  async saveSectionEvBattery2W(id, data) {
    try {
      const endpoint = API_CONFIG.ENDPOINTS.INSPECTIONS_2W.SECTION_EV_BATTERY.replace(":id", id);
      const formData = new FormData();
      Object.keys(data).forEach(key => {
        const value = data[key];
        if (value !== null && value !== undefined) {
          if (typeof value === "string" && (value.startsWith("file://") || value.startsWith("content://"))) {
            const filename = value.split("/").pop();
            const match = /\.(\w+)$/.exec(filename);
            const type = match ? `${key.toLowerCase().includes("video") ? "video" : "image"}/${match[1]}` : "image/jpeg";
            formData.append(key, { uri: value, name: filename, type });
          } else {
            formData.append(key, value);
          }
        }
      });
      const response = await apiService.putMultipart(endpoint, formData);
      return response.data || response;
    } catch (error) {
      console.error("Error saving 2W EV battery section:", error);
      throw error;
    }
  }

  async saveSectionMechanical2W(id, data) {
        console.log("payload", data);
    try {
      const endpoint = API_CONFIG.ENDPOINTS.INSPECTIONS_2W.SECTION_MECHANICAL.replace(":id", id);
      const formData = new FormData();
      Object.keys(data).forEach(key => {
        const value = data[key];
        if (value !== null && value !== undefined) {
          if (typeof value === "string" && (value.startsWith("file://") || value.startsWith("content://"))) {
            const filename = value.split("/").pop();
            const match = /\.(\w+)$/.exec(filename);
            const type = match ? `image/${match[1]}` : "image/jpeg";
            formData.append(key, { uri: value, name: filename, type });
          } else {
            formData.append(key, value);
          }
        }
      });
      const response = await apiService.putMultipart(endpoint, formData);
      return response.data || response;
    } catch (error) {
      console.error("Error saving 2W mechanical section:", error);
      throw error;
    }
  }

  async saveSectionExteriorPanels2W(id, payload) {
    try {
      const endpoint = API_CONFIG.ENDPOINTS.INSPECTIONS_2W.SECTION_EXTERIOR_PANELS.replace(":id", id);
      const formData = new FormData();

      payload.panels.forEach((panel, index) => {
        formData.append(`panels[${index}].panelName`, panel.panelName);
        formData.append(`panels[${index}].originalPaint`, panel.originalPaint);
        formData.append(`panels[${index}].repainted`, panel.repainted);
        if (panel.dentSeverity) formData.append(`panels[${index}].dentSeverity`, panel.dentSeverity);
        if (panel.scratchSeverity) formData.append(`panels[${index}].scratchSeverity`, panel.scratchSeverity);
        formData.append(`panels[${index}].rustPresent`, panel.rustPresent);
        if (panel.dentPhotoIndices && panel.dentPhotoIndices.length > 0) {
          panel.dentPhotoIndices.forEach(photoIndex => {
            formData.append(`panels[${index}].dentPhotoIndices`, photoIndex);
          });
        }
        if (panel.scratchPhotoIndices && panel.scratchPhotoIndices.length > 0) {
          panel.scratchPhotoIndices.forEach(photoIndex => {
            formData.append(`panels[${index}].scratchPhotoIndices`, photoIndex);
          });
        }
        if (panel.panelPhotoIndices && panel.panelPhotoIndices.length > 0) {
          panel.panelPhotoIndices.forEach(photoIndex => {
            formData.append(`panels[${index}].panelPhotoIndices`, photoIndex);
          });
        }
      });

      if (payload.photos && payload.photos.length > 0) {
        payload.photos.forEach((photoUri) => {
          const filename = photoUri.split("/").pop();
          const match = /\.(\w+)$/.exec(filename);
          const type = match ? `image/${match[1]}` : "image/jpeg";
          formData.append("panelPhotos", { uri: photoUri, name: filename, type });
        });
      }

      const response = await apiService.putMultipart(endpoint, formData);
      return response.data || response;
    } catch (error) {
      console.error("Error saving 2W exterior panels section:", error);
      throw error;
    }
  }

  async saveSectionGlassExterior2W(id, data) {
    try {
      const endpoint = API_CONFIG.ENDPOINTS.INSPECTIONS_2W.SECTION_GLASS_EXTERIOR.replace(":id", id);
      const response = await apiService.put(endpoint, data);
      return response.data || response;
    } catch (error) {
      console.error("Error saving 2W glass exterior section:", error);
      throw error;
    }
  }

  async saveSectionInteriorCabin2W(id, data) {
    try {
      const endpoint = API_CONFIG.ENDPOINTS.INSPECTIONS_2W.SECTION_COMFORT_ELECTRONICS.replace(":id", id);
      const response = await apiService.put(endpoint, data);
      return response.data || response;
    } catch (error) {
      console.error("Error saving 2W interior cabin section:", error);
      throw error;
    }
  }

  async saveSectionStructuralHistory2W(id, data) {
    try {
      const endpoint = API_CONFIG.ENDPOINTS.INSPECTIONS_2W.SECTION_STRUCTURAL_HISTORY.replace(":id", id);
      const formData = new FormData();
      Object.keys(data).forEach(key => {
        const value = data[key];
        if (value !== null && value !== undefined) {
          if (Array.isArray(value)) {
            value.forEach(fileUri => {
              if (typeof fileUri === "string" && (fileUri.startsWith("file://") || fileUri.startsWith("content://"))) {
                const filename = fileUri.split("/").pop();
                const match = /\.(\w+)$/.exec(filename);
                const type = match ? `image/${match[1]}` : "image/jpeg";
                formData.append(key, { uri: fileUri, name: filename, type });
              }
            });
          } else if (typeof value === "string" && (value.startsWith("file://") || value.startsWith("content://"))) {
            const filename = value.split("/").pop();
            const match = /\.(\w+)$/.exec(filename);
            const type = match ? `image/${match[1]}` : "image/jpeg";
            formData.append(key, { uri: value, name: filename, type });
          } else {
            formData.append(key, value);
          }
        }
      });
      const response = await apiService.putMultipart(endpoint, formData);
      return response.data || response;
    } catch (error) {
      console.error("Error saving 2W structural history section:", error);
      throw error;
    }
  }

  async saveSectionTyres2W(id, data) {
    try {
      const endpoint = API_CONFIG.ENDPOINTS.INSPECTIONS_2W.SECTION_TYRES.replace(":id", id);
      const formData = new FormData();

      Object.keys(data).forEach(key => {
        const value = data[key];
        if (value !== null && value !== undefined) {
          if (key === "frontTyrePhoto" || key === "rearTyrePhoto") {
            if (typeof value === "string" && (value.startsWith("file://") || value.startsWith("content://"))) {
              const filename = value.split("/").pop();
              const match = /\.(\w+)$/.exec(filename);
              const type = match ? `image/${match[1]}` : "image/jpeg";
              formData.append(key, { uri: value, name: filename, type });
            }
          } else {
            formData.append(key, value);
          }
        }
      });

      const response = await apiService.putMultipart(endpoint, formData);
      return response.data || response;
    } catch (error) {
      console.error("Error saving 2W tyres section:", error);
      throw error;
    }
  }

  async saveSectionObd2W(id, data) {
    try {
      const endpoint = API_CONFIG.ENDPOINTS.INSPECTIONS_2W.SECTION_OBD.replace(":id", id);

      const formData = new FormData();
      Object.keys(data).forEach(key => {
        const value = data[key];
        if (value !== null && value !== undefined) {
          if (typeof value === "string" && (value.startsWith("file://") || value.startsWith("content://"))) {
            const filename = value.split("/").pop();
            const match = /\.(\w+)$/.exec(filename);
            const type = match ? `image/${match[1]}` : "image/jpeg";

            formData.append(key, {
              uri: value,
              name: filename,
              type: type
            });
          } else {
            formData.append(key, value);
          }
        }
      });

      const response = await apiService.putMultipart(endpoint, formData);
      return response.data || response;
    } catch (error) {
      console.error("Error saving 2W OBD section:", error);
      throw error;
    }
  }

  async saveSectionModifications2W(id, payload) {
    try {
      const endpoint = API_CONFIG.ENDPOINTS.INSPECTIONS_2W.SECTION_MODIFICATIONS.replace(":id", id);
      const formData = new FormData();

      formData.append("modificationsDetected", payload.modificationsDetected);
      if (payload.modificationCount !== null && payload.modificationCount !== undefined) {
        formData.append("modificationCount", payload.modificationCount);
      }
      if (payload.modificationRiskLevel) {
        formData.append("modificationRiskLevel", payload.modificationRiskLevel);
      }
      if (payload.sellerDeclarationMatch !== null && payload.sellerDeclarationMatch !== undefined) {
        formData.append("sellerDeclarationMatch", payload.sellerDeclarationMatch);
      }

      if (payload.modificationItems && payload.modificationItems.length > 0) {
        payload.modificationItems.forEach((item, index) => {
          if (item.modificationCategory) formData.append(`modificationItems[${index}].modificationCategory`, item.modificationCategory);
          if (item.modificationType) formData.append(`modificationItems[${index}].modificationType`, item.modificationType);
          formData.append(`modificationItems[${index}].isOem`, item.isOem);
          if (item.impactOnWarranty) formData.append(`modificationItems[${index}].impactOnWarranty`, item.impactOnWarranty);
          if (item.impactOnSafety) formData.append(`modificationItems[${index}].impactOnSafety`, item.impactOnSafety);
          formData.append(`modificationItems[${index}].documentationAvailable`, item.documentationAvailable);
          if (item.photoIndex !== null && item.photoIndex !== undefined) {
            formData.append(`modificationItems[${index}].photoIndex`, item.photoIndex);
          }
          if (item.remarks) formData.append(`modificationItems[${index}].remarks`, item.remarks);
        });
      }

      if (payload.photos && payload.photos.length > 0) {
        payload.photos.forEach((photoUri) => {
          const filename = photoUri.split("/").pop();
          const match = /\.(\w+)$/.exec(filename);
          const type = match ? `image/${match[1]}` : "image/jpeg";
          formData.append("modificationPhotos", { uri: photoUri, name: filename, type });
        });
      }

      const response = await apiService.putMultipart(endpoint, formData);
      return response.data || response;
    } catch (error) {
      console.error("Error saving 2W modifications section:", error);
      throw error;
    }
  }

  async saveSectionMedia2W(id, data) {
    try {
      const endpoint = API_CONFIG.ENDPOINTS.INSPECTIONS_2W.SECTION_MEDIA.replace(":id", id);
      const formData = new FormData();

      const mediaKeys = ["testRideVideo", "chassisNumberPhoto", "engineNumberPhoto"];

      mediaKeys.forEach(key => {
        const value = data[key];
        if (value && typeof value === "string" && (value.startsWith("file://") || value.startsWith("content://"))) {
          const filename = value.split("/").pop();
          const match = /\.(\w+)$/.exec(filename);
          const isVideo = key.toLowerCase().includes("video");
          const type = match ? `${isVideo ? "video" : "image"}/${match[1]}` : (isVideo ? "video/mp4" : "image/jpeg");
          formData.append(key, { uri: value, name: filename, type });
        }
      });

      const response = await apiService.putMultipart(endpoint, formData);
      return response.data || response;
    } catch (error) {
      console.error("Error saving 2W media section:", error);
      throw error;
    }
  }

  // Save Section 11: 2W Vehicle Specs
  async saveSectionVehicleSpecs2W(id, data) {
    try {
      const endpoint = API_CONFIG.ENDPOINTS.INSPECTIONS_2W.SECTION_VEHICLE_SPECS.replace(":id", id);
      const response = await apiService.put(endpoint, data);
      return response.data || response;
    } catch (error) {
      console.error("Error saving 2W vehicle specs section:", error);
      throw error;
    }
  }

  // Save Section 11: 2W Vehicle Documents
  async saveSectionVehicleDocuments2W(id, data) {
    try {
      const endpoint = API_CONFIG.ENDPOINTS.INSPECTIONS_2W.SECTION_VEHICLE_DOCUMENTS.replace(":id", id);
      const response = await apiService.put(endpoint, data);
      return response.data || response;
    } catch (error) {
      console.error("Error saving 2W vehicle documents section:", error);
      throw error;
    }
  }

  async submitInspection2W(id) {
    try {
      const endpoint = API_CONFIG.ENDPOINTS.INSPECTIONS_2W.SUBMIT.replace(":id", id);
      const response = await apiService.post(endpoint, {});
      return response.data || response;
    } catch (error) {
      console.error("Error submitting 2W inspection:", error);
      throw error;
    }
  }

  // Get Full Inspection Report
  async getInspectionReport(id, category) {
    try {
      const is2W = (category || "").toUpperCase().includes("TWO") || (category || "").toUpperCase() === "2W" || (category || "").toUpperCase().includes("2");
      const endpoint = is2W
        ? API_CONFIG.ENDPOINTS.INSPECTIONS_2W.GET_REPORT.replace(":id", id)
        : API_CONFIG.ENDPOINTS.INSPECTIONS.GET_REPORT.replace(":id", id);
      console.log("Endpoint:", endpoint);
      const response = await apiService.get(endpoint);
      console.log("Response:", response);
      return response.data || response;
    } catch (error) {
      console.error("Error fetching inspection report:", error);
      throw error;
    }
  }

  async getIncomeHistory() {
    try {
      const endpoint = API_CONFIG.ENDPOINTS.INSPECTIONS.INCOME_HISTORY;
      const response = await apiService.get(endpoint);
      return response.data || response;
    } catch (error) {
      console.error("Error fetching income history:", error);
      throw error;
    }
  }

  // Get Income KPIs
  async getIncomeKpis() {
    try {
      const endpoint = API_CONFIG.ENDPOINTS.INSPECTIONS.INCOME_KPIS;
      const response = await apiService.get(endpoint);
      return response.data || response;
    } catch (error) {
      console.error("Error fetching income KPIs:", error);
      throw error;
    }
  }

  // Get Home KPIs
  async getHomeKpis() {
    try {
      const endpoint = API_CONFIG.ENDPOINTS.INSPECTIONS.HOME_KPIS;
      const response = await apiService.get(endpoint);
      return response.data || response;
    } catch (error) {
      console.error("Error fetching home KPIs:", error);
      throw error;
    }
  }

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

  async reject(id, reason) {
    try {
      const endpoint = API_CONFIG.ENDPOINTS.INSPECTIONS.REJECT.replace(":id", id);
      const urlWithParams = `${endpoint}?rejectionReason=${encodeURIComponent(reason)}`;
      const response = await apiService.put(urlWithParams);
      return response.data;
    } catch (error) {
      console.error("Error rejecting inspection:", error);
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
