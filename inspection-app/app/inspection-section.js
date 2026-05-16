import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Alert, ActivityIndicator, Modal, TextInput,
} from "react-native";
import { useState, useEffect, useCallback, memo } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { MiniToggle, MediaUpload, NumberInput, SliderInput, TextArea, TapButtons, ConditionButtons } from "../components/inspection/FormField";
import inspectionSchema2W from "../reecomm_inspection_2W.json";
import inspectionSchema4W from "../reecomm_inspection_4W.json";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { inspectionAPI } from "../services/api/inspectionAPI";

export default function InspectionSectionScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();

  const sectionKey      = params.sectionKey      || "section_1_engine_powertrain";
  const vehicleCategory = params.vehicleCategory || "2W";
  const inspectionId    = params.inspectionId    || "unknown";
  const isReadOnly      = params.readOnly        === "true";

  const schema      = vehicleCategory === "4W" ? inspectionSchema4W : inspectionSchema2W;
  const sectionData = schema.sections?.[sectionKey];

  const [formData, setFormData]       = useState({});
  const [loading, setLoading]         = useState(true);
  const [saving, setSaving]           = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  // For modifications — add item modal
  const [addModModal, setAddModModal] = useState(false);
  const [newMod, setNewMod]           = useState({});

  const storageKey = `inspection_${inspectionId}_${sectionKey}`;
  const [fuelType, setFuelType] = useState(params.fuelType || "");
  const [subType, setSubType] = useState(params.vehicleSubType || "");

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        if (isReadOnly) {
          const res = await inspectionAPI.getInspectionReport(inspectionId);
          const report = res.data || res;
          if (report.fuelType) setFuelType(report.fuelType);
          if (report.vehicleSubType) setSubType(report.vehicleSubType);
          const mappedData = mapReportToSectionState(report, sectionKey);
          setFormData(mappedData);
        } else {
          const saved = await AsyncStorage.getItem(storageKey);
          if (saved) setFormData(JSON.parse(saved));
        }
      } catch (e) {
        console.error("Load Error:", e);
      } finally {
        setLoading(false);
      }
    })();
  }, [storageKey, isReadOnly]);

  const normalizeEnum = (val) => {
    if (!val) return null;
    if (val === "NA") return "N/A";
    if (val === "NONE") return "None";
    // Convert "MAJOR" to "Major", "PASS" to "Pass", "GOOD" to "Good"
    return val.charAt(0).toUpperCase() + val.slice(1).toLowerCase();
  };

  const mapReportToSectionState = (report, key) => {
    if (key === "section_1_engine_powertrain") {
      const s = report.engineAndPowertrain || {};
      return {
        engine_sound_video: s.engineSoundVideo,
        overheating: normalizeEnum(s.overheating),
        misfiring_smoke: normalizeEnum(s.misfiringSmoke),
        back_compression: normalizeEnum(s.backCompression),
        oil_leakage: normalizeEnum(s.oilLeakage),
        coolant_leakage: normalizeEnum(s.coolantLeakage),
        engine_mount_condition: normalizeEnum(s.engineMountCondition),
        gaskets_and_seals: normalizeEnum(s.gasketsAndSeals),
        throttle_body: normalizeEnum(s.throttleBody),
        exhaust_leaks: normalizeEnum(s.exhaustLeaks),
        catalytic_converter: normalizeEnum(s.catalyticConverter),
        fuel_tank: normalizeEnum(s.fuelTank),
        fuel_lines: normalizeEnum(s.fuelLines),
        fuel_rails_injectors: normalizeEnum(s.fuelRailsInjectors),
        wiring_harness: normalizeEnum(s.wiringHarness),
        battery_voltage: normalizeEnum(s.batteryVoltage),
        battery_voltage_value: s.batteryVoltageValue?.toString(),
        alternator_starter: normalizeEnum(s.alternatorStarter),
        gear_shifting: normalizeEnum(s.gearShifting),
        gearbox_leaks: normalizeEnum(s.gearboxLeaks),
        clutch_life_percent: s.clutchLifePercent,
        drive_shaft_axle: normalizeEnum(s.driveShaftAxle)
      };
    }
    if (key === "section_1_ev_battery") {
      const s = report.evBattery || {};
      return {
        motor_running_video: s.motorRunningVideo,
        battery_soh_percent: s.batterySohPercent,
        battery_soc_percent: s.batterySocPercent,
        battery_pack_condition: normalizeEnum(s.batteryPackCondition),
        battery_thermal_cooling: normalizeEnum(s.batteryThermalCooling),
        charging_port_condition: normalizeEnum(s.chargingPortCondition),
        bms_warning_light: normalizeEnum(s.bmsWarningLight),
        range_indicator_functional: normalizeEnum(s.rangeIndicatorFunctional),
        motor_noise_vibration: normalizeEnum(s.motorNoiseVibration),
        regenerative_braking_active: normalizeEnum(s.regenerativeBrakingActive),
        hv_wiring_harness: normalizeEnum(s.hvWiringHarness),
        dc_dc_converter: normalizeEnum(s.dcDcConverter),
        onboard_charger_status: normalizeEnum(s.onboardChargerStatus)
      };
    }
    if (key === "section_2_mechanical") {
      const s = report.mechanical || {};
      return {
        steering_performance: normalizeEnum(s.steeringPerformance),
        steering_rack_leakage: normalizeEnum(s.steeringRackLeakage),
        shocks_struts: normalizeEnum(s.shocksStruts),
        ball_joints_bushes: normalizeEnum(s.ballJointsBushes),
        suspension_noise: normalizeEnum(s.suspensionNoise),
        disc_drum_brake_condition: normalizeEnum(s.discDrumBrakeCondition),
        brake_pad_life_percent: s.brakePadLifePercent,
        brake_fluid_lines: normalizeEnum(s.brakeFluidLines),
        abs_warning_light: normalizeEnum(s.absWarningLight)
      };
    }
    if (key === "section_3_exterior_panels") {
      const panels = {};
      const s = report.exteriorPanels || {};
      (s.panels || []).forEach(p => {
        panels[p.panelName] = {
          original_paint: p.originalPaint,
          repainted: p.repainted,
          dent_severity: normalizeEnum(p.dentSeverity),
          scratch_severity: normalizeEnum(p.scratchSeverity),
          rust_present: p.rustPresent,
          panel_photo: p.panelPhoto
        };
      });
      return panels;
    }
    if (key === "section_4_glass_exterior_electronics") {
      const s = report.glassAndExteriorElectronics || {};
      return {
        glass_scratches: normalizeEnum(s.glassScratches),
        glass_cracks_chips: normalizeEnum(s.glassCracksChips),
        side_mirrors: normalizeEnum(s.sideMirrors),
        parking_sensors: normalizeEnum(s.parkingSensors),
        exterior_lights_all: normalizeEnum(s.exteriorLightsAll),
        wipers_washers: normalizeEnum(s.wipersWashers)
      };
    }
    if (key === "section_5_interior_cabin") {
      const s = report.interiorAndCabin || {};
      return {
        ac_cooling_heating: normalizeEnum(s.acCoolingHeating),
        ac_compressor: normalizeEnum(s.acCompressor),
        ac_gas_leakage: normalizeEnum(s.acGasLeakage),
        hvac_climate_control: normalizeEnum(s.hvacClimateControl),
        speakers: normalizeEnum(s.speakers),
        infotainment_system: normalizeEnum(s.infotainmentSystem),
        interior_lights: normalizeEnum(s.interiorLights),
        central_locking: normalizeEnum(s.centralLocking),
        power_windows_all: normalizeEnum(s.powerWindowsAll),
        reverse_camera_sensors: normalizeEnum(s.reverseCameraSensors),
        seat_condition: normalizeEnum(s.seatCondition),
        dashboard_condition: normalizeEnum(s.dashboardCondition),
        water_flood_damage_signs: normalizeEnum(s.waterFloodDamageSigns)
      };
    }
    if (key === "section_6_structural_history") {
      const s = report.structuralHistory || {};
      return {
        structural_damage: normalizeEnum(s.structuralDamage),
        flood_damage_confirmed: normalizeEnum(s.floodDamageConfirmed),
        underbody_condition: normalizeEnum(s.underbodyCondition),
        chassis_alignment: normalizeEnum(s.chassisAlignment)
      };
    }
    if (key === "section_7_tyres") {
      const s = report.tyres || {};
      return {
        "Front Left": {
          tread_depth_mm: s.frontLeftTreadDepthMm,
          tyre_age_years: s.frontLeftTyreAgeYears,
          condition: normalizeEnum(s.frontLeftTyreCondition),
          tyre_photo: s.frontLeftTyrePhoto
        },
        "Front Right": {
          tread_depth_mm: s.frontRightTreadDepthMm,
          tyre_age_years: s.frontRightTyreAgeYears,
          condition: normalizeEnum(s.frontRightTyreCondition),
          tyre_photo: s.frontRightTyrePhoto
        },
        "Rear Left": {
          tread_depth_mm: s.rearLeftTreadDepthMm,
          tyre_age_years: s.rearLeftTyreAgeYears,
          condition: normalizeEnum(s.rearLeftTyreCondition),
          tyre_photo: s.rearLeftTyrePhoto
        },
        "Rear Right": {
          tread_depth_mm: s.rearRightTreadDepthMm,
          tyre_age_years: s.rearRightTyreAgeYears,
          condition: normalizeEnum(s.rearRightTyreCondition),
          tyre_photo: s.rearRightTyrePhoto
        },
        spare_tyre_condition: normalizeEnum(s.spareTyreCondition)
      };
    }
    if (key === "section_8_obd_diagnostics") {
      const s = report.obdDiagnostics || {};
      return {
        obd_scan_done: normalizeEnum(s.obdScanDone),
        error_codes_present: s.errorCodesPresent,
        error_code_details: s.errorCodeDetails,
        emission_status: normalizeEnum(s.emissionStatus)
      };
    }
    if (key === "section_9_modifications") {
      const s = report.modifications || {};
      return {
        modifications_detected: s.modificationsDetected,
        modification_count: s.modificationCount,
        modification_risk_level: normalizeEnum(s.modificationRiskLevel),
        seller_declaration_match: s.sellerDeclarationMatch,
        modification_items: (s.modificationItems || []).map(m => ({
          modification_category: m.modificationCategory,
          modification_type: m.modificationType,
          is_oem: m.isOem,
          impact_on_warranty: normalizeEnum(m.impactOnWarranty),
          impact_on_safety: normalizeEnum(m.impactOnSafety),
          documentation_available: m.documentationAvailable,
          photo: m.photo,
          remarks: m.remarks
        }))
      };
    }
    if (key === "section_10_media") {
      const s = report.media || {};
      return {
        engine_or_motor_running_video: s.engineOrMotorRunningVideo,
        test_drive_video: s.testDriveVideo,
        underbody_photos: s.underbodyPhotos || [],
        major_dent_photos: s.majorDentPhotos || []
      };
    }
    return {};
  };

  const update = (key, value) => {
    if (isReadOnly) return;
    setFormData(prev => ({ ...prev, [key]: value }));
  };
  const updateNested = (group, key, value) => {
    if (isReadOnly) return;
    setFormData(prev => ({ ...prev, [group]: { ...(prev[group] || {}), [key]: value } }));
  };

  const mapEnum = (val) => {
    if (!val) return null;
    if (val === "N/A") return "NA";
    return val.toUpperCase();
  };

  const mapEngineData = (data) => {

    return {
      engineSoundVideo: data.engine_sound_video || null,
      overheating: mapEnum(data.overheating),
      misfiringSmoke: mapEnum(data.misfiring_smoke),
      backCompression: mapEnum(data.back_compression),
      oilLeakage: mapEnum(data.oil_leakage),
      coolantLeakage: mapEnum(data.coolant_leakage),
      engineMountCondition: mapEnum(data.engine_mount_condition),
      gasketsAndSeals: mapEnum(data.gaskets_and_seals),
      throttleBody: mapEnum(data.throttle_body),
      exhaustLeaks: mapEnum(data.exhaust_leaks),
      catalyticConverter: mapEnum(data.catalytic_converter),
      fuelTank: mapEnum(data.fuel_tank),
      fuelLines: mapEnum(data.fuel_lines),
      fuelRailsInjectors: mapEnum(data.fuel_rails_injectors),
      wiringHarness: mapEnum(data.wiring_harness),
      batteryVoltage: mapEnum(data.battery_voltage),
      batteryVoltageValue: data.battery_voltage_value ? parseFloat(data.battery_voltage_value) : null,
      alternatorStarter: mapEnum(data.alternator_starter),
      gearShifting: mapEnum(data.gear_shifting),
      gearboxLeaks: mapEnum(data.gearbox_leaks),
      clutchLifePercent: data.clutch_life_percent ? parseInt(data.clutch_life_percent) : null,
      driveShaftAxle: mapEnum(data.drive_shaft_axle)
    };
  };

  const mapEvBatteryData = (data) => {

    return {
      motorRunningVideo: data.motor_running_video || null,
      batterySohPercent: data.battery_soh_percent ? parseInt(data.battery_soh_percent) : null,
      batterySocPercent: data.battery_soc_percent ? parseInt(data.battery_soc_percent) : null,
      batteryPackCondition: mapEnum(data.battery_pack_condition),
      batteryThermalCooling: mapEnum(data.battery_thermal_cooling),
      chargingPortCondition: mapEnum(data.charging_port_condition),
      bmsWarningLight: mapEnum(data.bms_warning_light),
      rangeIndicatorFunctional: mapEnum(data.range_indicator_functional),
      motorNoiseVibration: mapEnum(data.motor_noise_vibration),
      regenerativeBrakingActive: mapEnum(data.regenerative_braking_active),
      hvWiringHarness: mapEnum(data.hv_wiring_harness),
      dcDcConverter: mapEnum(data.dc_dc_converter),
      onboardChargerStatus: mapEnum(data.onboard_charger_status)
    };
  };

  const mapMechanicalData = (data) => {
    return {
      steeringPerformance: mapEnum(data.steering_performance),
      steeringRackLeakage: mapEnum(data.steering_rack_leakage),
      shocksStruts: mapEnum(data.shocks_struts),
      ballJointsBushes: mapEnum(data.ball_joints_bushes),
      suspensionNoise: mapEnum(data.suspension_noise),
      discDrumBrakeCondition: mapEnum(data.disc_drum_brake_condition),
      brakePadLifePercent: data.brake_pad_life_percent ? parseInt(data.brake_pad_life_percent) : null,
      brakeFluidLines: mapEnum(data.brake_fluid_lines),
      absWarningLight: mapEnum(data.abs_warning_light)
    };
  };

  const mapExteriorPanelsData = (data, panelsList) => {
    const photos = [];
    const panels = (panelsList || []).map((panelName) => {
      const panelData = data[panelName] || {};
      let photoIndex = null;
      
      // If there's a new photo, add it to the photos array and set the index
      if (panelData.panel_photo && typeof panelData.panel_photo === "string" && (panelData.panel_photo.startsWith("file://") || panelData.panel_photo.startsWith("content://"))) {
        photoIndex = photos.length;
        photos.push(panelData.panel_photo);
      }

      return {
        panelName,
        originalPaint: !!panelData.original_paint,
        repainted: !!panelData.repainted,
        dentSeverity: mapEnum(panelData.dent_severity),
        scratchSeverity: mapEnum(panelData.scratch_severity),
        rustPresent: !!panelData.rust_present,
        photoIndex
      };
    });

    return { panels, photos };
  };

  const mapGlassExteriorData = (data) => {
    return {
      glassScratches: mapEnum(data.glass_scratches),
      glassCracksChips: mapEnum(data.glass_cracks_chips),
      sideMirrors: mapEnum(data.side_mirrors),
      parkingSensors: mapEnum(data.parking_sensors),
      exteriorLightsAll: mapEnum(data.exterior_lights_all),
      wipersWashers: mapEnum(data.wipers_washers)
    };
  };

  const mapInteriorCabinData = (data) => {
    return {
      acCoolingHeating: mapEnum(data.ac_cooling_heating),
      acCompressor: mapEnum(data.ac_compressor),
      acGasLeakage: mapEnum(data.ac_gas_leakage),
      hvacClimateControl: mapEnum(data.hvac_climate_control),
      speakers: mapEnum(data.speakers),
      infotainmentSystem: mapEnum(data.infotainment_system),
      interiorLights: mapEnum(data.interior_lights),
      centralLocking: mapEnum(data.central_locking),
      powerWindowsAll: mapEnum(data.power_windows_all),
      reverseCameraSensors: mapEnum(data.reverse_camera_sensors),
      seatCondition: mapEnum(data.seat_condition),
      dashboardCondition: mapEnum(data.dashboard_condition),
      waterFloodDamageSigns: mapEnum(data.water_flood_damage_signs)
    };
  };

  const mapStructuralHistoryData = (data) => {
    return {
      structuralDamage: mapEnum(data.structural_damage),
      floodDamageConfirmed: mapEnum(data.flood_damage_confirmed),
      underbodyCondition: mapEnum(data.underbody_condition),
      chassisAlignment: mapEnum(data.chassis_alignment)
    };
  };

  const mapTyresData = (data) => {
    const posMap = {
      "Front Left": "frontLeft",
      "Front Right": "frontRight",
      "Rear Left": "rearLeft",
      "Rear Right": "rearRight"
    };

    const payload = {
      spareTyreCondition: mapEnum(data.spare_tyre_condition)
    };

    Object.keys(posMap).forEach(pos => {
      const camel = posMap[pos];
      const tData = data[pos] || {};
      payload[`${camel}TreadDepthMm`] = tData.tread_depth_mm ? parseFloat(tData.tread_depth_mm) : null;
      payload[`${camel}TyreAgeYears`] = tData.tyre_age_years ? parseInt(tData.tyre_age_years) : null;
      payload[`${camel}TyreCondition`] = mapEnum(tData.condition);
      payload[`${camel}TyrePhoto`] = tData.tyre_photo || null;
    });

    return payload;
  };

  const mapObdData = (data) => {
    return {
      obdScanDone: mapEnum(data.obd_scan_done),
      errorCodesPresent: !!data.error_codes_present,
      errorCodeDetails: data.error_code_details || null,
      emissionStatus: mapEnum(data.emission_status)
    };
  };

  const mapModificationsData = (data) => {
    const items = data.modification_items || [];
    const photos = [];
    
    const mappedItems = items.map(item => {
      let photoIndex = null;
      // If there's a new photo, add it to the photos array and set the index
      if (item.photo && typeof item.photo === "string" && (item.photo.startsWith("file://") || item.photo.startsWith("content://"))) {
        photoIndex = photos.length;
        photos.push(item.photo);
      }

      return {
        modificationCategory: item.modification_category || null,
        modificationType: item.modification_type || null,
        isOem: !!item.is_oem,
        impactOnWarranty: mapEnum(item.impact_on_warranty),
        impactOnSafety: mapEnum(item.impact_on_safety),
        documentationAvailable: !!item.documentation_available,
        photoIndex,
        remarks: item.remarks || null
      };
    });

    return {
      modificationsDetected: !!data.modifications_detected,
      modificationCount: data.modification_count ? parseInt(data.modification_count) : mappedItems.length,
      modificationRiskLevel: mapEnum(data.modification_risk_level),
      sellerDeclarationMatch: !!data.seller_declaration_match,
      modificationItems: mappedItems,
      photos
    };
  };

  const mapMediaData = (data) => {
    return {
      engineOrMotorRunningVideo: data.engine_or_motor_running_video || null,
      testDriveVideo: data.test_drive_video || null,
      underbodyPhotos: data.underbody_photos || [],
      majorDentPhotos: data.major_dent_photos || []
    };
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // 1. Save to local storage for persistence
      await AsyncStorage.setItem(storageKey, JSON.stringify(formData));

      // 2. Call API if it's section_1_engine_powertrain or section_1_ev_battery
      if (sectionKey === "section_1_engine_powertrain" && vehicleCategory === "4W") {
        const payload = mapEngineData(formData);
        await inspectionAPI.saveSectionEngine(inspectionId, payload);
      } else if (sectionKey === "section_1_ev_battery" && vehicleCategory === "4W") {
        const payload = mapEvBatteryData(formData);
        await inspectionAPI.saveSectionEvBattery(inspectionId, payload);
      } else if (sectionKey === "section_2_mechanical" && vehicleCategory === "4W") {
        const payload = mapMechanicalData(formData);
        await inspectionAPI.saveSectionMechanical(inspectionId, payload);
      } else if (sectionKey === "section_3_exterior_panels" && vehicleCategory === "4W") {
        const payload = mapExteriorPanelsData(formData, sectionData.panels);
        await inspectionAPI.saveSectionExteriorPanels(inspectionId, payload);
      } else if (sectionKey === "section_4_glass_exterior_electronics" && vehicleCategory === "4W") {
        const payload = mapGlassExteriorData(formData);
        await inspectionAPI.saveSectionGlassExterior(inspectionId, payload);
      } else if (sectionKey === "section_5_interior_cabin" && vehicleCategory === "4W") {
        const payload = mapInteriorCabinData(formData);
        await inspectionAPI.saveSectionInteriorCabin(inspectionId, payload);
      } else if (sectionKey === "section_6_structural_history" && vehicleCategory === "4W") {
        const payload = mapStructuralHistoryData(formData);
        await inspectionAPI.saveSectionStructuralHistory(inspectionId, payload);
      } else if (sectionKey === "section_7_tyres" && vehicleCategory === "4W") {
        const payload = mapTyresData(formData);
        await inspectionAPI.saveSectionTyres(inspectionId, payload);
      } else if (sectionKey === "section_8_obd_diagnostics" && vehicleCategory === "4W") {
        const payload = mapObdData(formData);
        await inspectionAPI.saveSectionObd(inspectionId, payload);
      } else if (sectionKey === "section_9_modifications" && vehicleCategory === "4W") {
        const payload = mapModificationsData(formData);
        await inspectionAPI.saveSectionModifications(inspectionId, payload);
      } else if (sectionKey === "section_10_media" && vehicleCategory === "4W") {
        const payload = mapMediaData(formData);
        await inspectionAPI.saveSectionMedia(inspectionId, payload);
      }

      // 3. Update progress locally
      const progressKey = `inspection_${inspectionId}_progress`;
      const raw = await AsyncStorage.getItem(progressKey);
      const progress = raw ? JSON.parse(raw) : {};
      progress[sectionKey] = "completed";
      await AsyncStorage.setItem(progressKey, JSON.stringify(progress));
      
      setSaveSuccess(true);
    } catch (e) {
      console.error("Save Error:", e);
      Alert.alert("Error", e.message || "Failed to save. Please try again.");
    } finally { setSaving(false); }
  };

  // ── Label helper ─────────────────────────────────────────────────────────────
  const toLabel = (key) => key.split("_").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");

  // ── Enum button row (handles any enum array) ─────────────────────────────────
  const EnumRow = ({ options, value, onChange, color }) => (
    <View style={styles.enumRow}>
      {options.map(opt => {
        const sel = value === opt;
        return (
          <TouchableOpacity
            key={opt}
            style={[styles.enumBtn, sel && { backgroundColor: color || "#1E56A0", borderColor: color || "#1E56A0" }]}
            onPress={() => !isReadOnly && onChange(opt)}
            activeOpacity={isReadOnly ? 1 : 0.7}
          >
            <Text style={[styles.enumBtnText, sel && { color: "#fff" }]}>{opt}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  // ── Field Visibility Helper ─────────────────────────────────────────────────
  const shouldShowField = useCallback((fieldName, fieldConfig) => {
    // 1. Fuel Type Check
    if (fieldConfig.applicable_fuel_types && fuelType) {
      const activeFT = fuelType.toUpperCase();
      const isApplicable = fieldConfig.applicable_fuel_types.some(ft => {
        const targetFT = ft.toUpperCase();
        // Handle "EV (Electric)" vs "EV"
        if (targetFT === "EV (ELECTRIC)" && activeFT === "EV") return true;
        if (targetFT === "EV" && activeFT === "EV (ELECTRIC)") return true;
        return targetFT === activeFT;
      });
      if (!isApplicable) return false;
    }

    // 2. Subtype / Note Check (Simple version: if note says "4W only" and we are 2W, or vice versa)
    if (fieldConfig.note && fieldConfig.note.toLowerCase().includes("only")) {
       const note = fieldConfig.note.toLowerCase();
       if (note.includes("4w only") && vehicleCategory !== "4W") return false;
       if (note.includes("2w only") && vehicleCategory !== "2W") return false;
       
       // Handle specific subtypes if mentioned in note e.g. "4W RWD only"
       if (note.includes("rwd only") && subType && !subType.toLowerCase().includes("rwd")) return false;
    }

    // 3. Conditional Show check
    if (fieldConfig.conditional_show) {
      try {
        const parts = fieldConfig.conditional_show.split(" ");
        if (parts.length === 3) {
          const [condField, condOp, condVal] = parts;
          const actualVal = formData[condField];
          
          if (condOp === "===") {
            // Handle boolean strings in schema
            let target = condVal;
            if (condVal === "true") target = true;
            else if (condVal === "false") target = false;
            else target = condVal.replace(/'/g, "");

            if (actualVal !== target) return false;
          }
        }
      } catch (e) {
        console.error("Condition eval error:", e);
      }
    }

    return true;
  }, [fuelType, subType, vehicleCategory, formData]);

  // ── Generic field renderer ────────────────────────────────────────────────────
  const renderField = useCallback((fieldName, fieldConfig, value, onChange) => {
    if (!shouldShowField(fieldName, fieldConfig)) return null;

    const label = toLabel(fieldName);
    const isVideo = fieldConfig.description?.toLowerCase().includes("video");

    if (fieldConfig.type === "media_url") {
      return (
        <MediaUpload key={fieldName} label={label} value={value} onChange={onChange}
          required={fieldConfig.required}
          type={isVideo ? "video" : "photo"}
          maxCount={isVideo ? 1 : undefined} />
      );
    }
    if (fieldConfig.type === "array" && fieldConfig.items?.type === "media_url") {
      return (
        <MediaUpload key={fieldName} label={label} value={value} onChange={onChange}
          required={fieldConfig.required} type="photo" />
      );
    }
    if (fieldConfig.input_ui === "tap_buttons") {
      const isBool = fieldConfig.type === "boolean";
      const opts = isBool ? ["True", "False", "N/A"] : ["Pass", "Fail", "N/A"];
      const displayVal = isBool 
        ? (value === true ? "True" : value === false ? "False" : (value === "NA" ? "N/A" : value))
        : value;

      return (
        <TapButtons 
          key={fieldName} 
          label={label} 
          options={opts}
          value={displayVal} 
          onChange={(v) => {
            if (isBool) {
              onChange(v === "True" ? true : v === "False" ? false : "NA");
            } else {
              onChange(v);
            }
          }} 
          required={fieldConfig.required} 
        />
      );
    }
    if (fieldConfig.input_ui === "condition_buttons") {
      return <ConditionButtons key={fieldName} label={label} value={value} onChange={onChange} required={fieldConfig.required} />;
    }
    if (fieldConfig.input_ui === "mini_buttons" || (fieldConfig.enum && !fieldConfig.input_ui)) {
      return (
        <View key={fieldName} style={styles.fieldWrap}>
          <Text style={styles.fieldLabel}>{label}{fieldConfig.required && <Text style={{ color: "#EF4444" }}> *</Text>}</Text>
          <EnumRow options={fieldConfig.enum} value={value} onChange={onChange} />
        </View>
      );
    }
    if (fieldConfig.input_ui === "mini_toggle" || fieldConfig.type === "boolean") {
      return <MiniToggle key={fieldName} label={label} value={value} onChange={onChange} />;
    }
    if (fieldConfig.input_ui === "slider") {
      return <SliderInput key={fieldName} label={label} value={value} onChange={onChange} unit={fieldConfig.unit || "%"} />;
    }
    if (fieldConfig.input_ui === "number_input" || fieldConfig.type === "number" || fieldConfig.type === "integer") {
      return <NumberInput key={fieldName} label={label} value={value} onChange={onChange} unit={fieldConfig.unit || ""} />;
    }
    if (fieldConfig.input_ui === "textarea" || fieldConfig.type === "string") {
      return <TextArea key={fieldName} label={label} value={value} onChange={onChange} placeholder={fieldConfig.description || ""} />;
    }
    return null;
  }, [styles]);

  // ── Optimized Section Components ─────────────────────────────────────────────
  const PanelCard = memo(({ panelName, panelData, perPanelFields, onUpdate, renderField }) => {
    return (
      <View style={styles.panelCard}>
        <View style={styles.panelHeader}>
          <View style={styles.panelHeaderIcon}>
            <Ionicons name="car-sport-outline" size={18} color="#1E56A0" />
          </View>
          <Text style={styles.panelTitle}>{panelName}</Text>
        </View>
        {Object.entries(perPanelFields).map(([fk, fc]) =>
          renderField(fk, fc, panelData[fk], (val) => onUpdate(fk, val))
        )}
      </View>
    );
  });

  const TyreCard = memo(({ pos, tyreData, perTyreFields, onUpdate, renderField }) => {
    return (
      <View style={styles.panelCard}>
        <View style={styles.panelHeader}>
          <View style={[styles.panelHeaderIcon, { backgroundColor: "#FEF3C7" }]}>
            <Ionicons name="ellipse-outline" size={18} color="#F59E0B" />
          </View>
          <Text style={styles.panelTitle}>{pos} Tyre</Text>
        </View>
        {Object.entries(perTyreFields).map(([fk, fc]) =>
          renderField(fk, fc, tyreData[fk], (val) => onUpdate(fk, val))
        )}
      </View>
    );
  });

  // ── Section 3: Panel Inspection ───────────────────────────────────────────────
  const renderPanelSection = () => {
    const panels = sectionData.panels || [];
    const perPanelFields = sectionData.per_panel_fields || {};

    return panels.map(panelName => {
      const onUpdate = (key, val) => {
        setFormData(prev => ({
          ...prev,
          [panelName]: { ...(prev[panelName] || {}), [key]: val },
        }));
      };

      return (
        <PanelCard
          key={panelName}
          panelName={panelName}
          panelData={formData[panelName] || {}}
          perPanelFields={perPanelFields}
          onUpdate={onUpdate}
          renderField={renderField}
        />
      );
    });
  };

  // ── Section 7: Tyre Inspection ────────────────────────────────────────────────
  const renderTyreSection = () => {
    const positions     = sectionData.positions || [];
    const perTyreFields = sectionData.per_tyre_fields || {};
    const spareConfig   = sectionData.spare_tyre_condition;

    return (
      <>
        {positions.map(pos => {
          const onUpdate = (key, val) => {
            setFormData(prev => ({
              ...prev,
              [pos]: { ...(prev[pos] || {}), [key]: val },
            }));
          };
          return (
            <TyreCard
              key={pos}
              pos={pos}
              tyreData={formData[pos] || {}}
              perTyreFields={perTyreFields}
              onUpdate={onUpdate}
              renderField={renderField}
            />
          );
        })}

        {spareConfig && (
          <View style={styles.panelCard}>
            <View style={styles.panelHeader}>
              <View style={[styles.panelHeaderIcon, { backgroundColor: "#DCFCE7" }]}>
                <Ionicons name="ellipse-outline" size={18} color="#16A34A" />
              </View>
              <Text style={styles.panelTitle}>Spare Tyre</Text>
            </View>
            <View style={styles.fieldWrap}>
              <Text style={styles.fieldLabel}>Spare Tyre Condition</Text>
              <EnumRow
                options={spareConfig.enum}
                value={formData.spare_tyre_condition}
                onChange={val => update("spare_tyre_condition", val)}
              />
            </View>
          </View>
        )}
      </>
    );
  };

  // ── Section 9: Modifications ──────────────────────────────────────────────────
  const renderModificationSection = () => {
    const summaryFields = sectionData.summary_fields || {};
    const itemFields    = sectionData.modification_items?.item_fields || {};
    const modDetected   = formData.modifications_detected === true || formData.modifications_detected === "true";
    const modItems      = formData.modification_items || [];

    const addModItem = () => {
      setFormData(prev => ({
        ...prev,
        modification_items: [...(prev.modification_items || []), newMod],
      }));
      setNewMod({});
      setAddModModal(false);
    };

    const removeModItem = (idx) => {
      setFormData(prev => ({
        ...prev,
        modification_items: prev.modification_items.filter((_, i) => i !== idx),
      }));
    };

    return (
      <>
        <View style={styles.formCard}>
          {/* modifications_detected as Yes/No */}
          <View style={styles.fieldWrap}>
            <Text style={styles.fieldLabel}>Modifications Detected?</Text>
            <EnumRow
              options={["Yes", "No"]}
              value={modDetected ? "Yes" : (formData.modifications_detected === false || formData.modifications_detected === "false") ? "No" : undefined}
              onChange={val => update("modifications_detected", val === "Yes")}
            />
          </View>

          {modDetected && (
            <>
              <NumberInput label="Modification Count" value={formData.modification_count}
                onChange={v => update("modification_count", v)} />
              <View style={styles.fieldWrap}>
                <Text style={styles.fieldLabel}>Modification Risk Level</Text>
                <EnumRow options={["Low", "Moderate", "High"]} value={formData.modification_risk_level}
                  onChange={v => update("modification_risk_level", v)} color="#F59E0B" />
              </View>
              <MiniToggle label="Seller Declaration Match" value={formData.seller_declaration_match}
                onChange={v => update("seller_declaration_match", v)} />
            </>
          )}
        </View>

        {modDetected && (
          <>
            <Text style={styles.subSectionTitle}>Modification Items</Text>
            {modItems.map((item, idx) => (
              <View key={idx} style={[styles.panelCard, { marginBottom: 10 }]}>
                <View style={styles.panelHeader}>
                  <View style={[styles.panelHeaderIcon, { backgroundColor: "#FEE2E2" }]}>
                    <Ionicons name="build-outline" size={18} color="#DC2626" />
                  </View>
                  <Text style={styles.panelTitle}>{item.modification_category || `Item ${idx + 1}`}</Text>
                  {!isReadOnly && (
                    <TouchableOpacity onPress={() => removeModItem(idx)} style={{ marginLeft: "auto" }}>
                      <Ionicons name="trash-outline" size={18} color="#DC2626" />
                    </TouchableOpacity>
                  )}
                </View>
                {Object.entries(itemFields).map(([fk, fc]) => {
                  const val = item[fk];
                  return renderField(fk, fc, val, (v) => {
                    if (isReadOnly) return;
                    const updated = [...modItems];
                    updated[idx] = { ...updated[idx], [fk]: v };
                    update("modification_items", updated);
                  });
                })}
              </View>
            ))}

            {!isReadOnly && (
              <TouchableOpacity style={styles.addModBtn} onPress={() => setAddModModal(true)} activeOpacity={0.7}>
                <Ionicons name="add-circle" size={20} color="#1E56A0" />
                <Text style={styles.addModBtnText}>Add Modification</Text>
              </TouchableOpacity>
            )}
          </>
        )}

        {/* Add Modification Modal */}
        <Modal visible={addModModal} transparent animationType="slide">
          <View style={styles.modModalOverlay}>
            <View style={styles.modModalContent}>
              <View style={styles.modModalHeader}>
                <Text style={styles.modModalTitle}>Add Modification</Text>
                <TouchableOpacity onPress={() => { setAddModModal(false); setNewMod({}); }}>
                  <Ionicons name="close" size={24} color="#6B7280" />
                </TouchableOpacity>
              </View>
              <ScrollView showsVerticalScrollIndicator={false}>
                {Object.entries(itemFields).map(([fk, fc]) =>
                  renderField(fk, fc, newMod[fk], (v) => setNewMod(prev => ({ ...prev, [fk]: v })))
                )}
                <View style={{ height: 20 }} />
              </ScrollView>
              <TouchableOpacity style={styles.modModalSave} onPress={addModItem} activeOpacity={0.8}>
                <Ionicons name="checkmark-circle" size={20} color="#fff" />
                <Text style={styles.modModalSaveText}>Add Item</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </>
    );
  };

  // ── Section router ────────────────────────────────────────────────────────────
  const renderSectionContent = () => {
    if (!sectionData) return <Text style={{ color: "#9CA3AF", textAlign: "center", marginTop: 20 }}>Section not found.</Text>;

    // Exterior Panels
    if (sectionData.panels && sectionData.per_panel_fields) return renderPanelSection();

    // Tyres
    if (sectionData.positions && sectionData.per_tyre_fields) return renderTyreSection();

    // Modifications
    if (sectionData.summary_fields) return renderModificationSection();

    // Standard fields
    if (sectionData.fields) {
      return (
        <View style={styles.formCard}>
          {Object.entries(sectionData.fields).map(([fk, fc]) => (
            <View key={fk}>
              {renderField(fk, fc, formData[fk], (val) => update(fk, val))}
              {fc.note && <Text style={styles.fieldNote}>{fc.note}</Text>}
            </View>
          ))}
        </View>
      );
    }

    return null;
  };

  if (loading) return (
    <View style={{ flex: 1, backgroundColor: "#F9FAFB", justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator size="large" color="#1E56A0" />
      <Text style={{ marginTop: 12, color: "#6B7280" }}>Loading section...</Text>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#F9FAFB" }}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>{sectionData?.label || "Section"}</Text>
          <Text style={styles.headerSubtitle}>Fill all required fields</Text>
        </View>
      </View>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16 }}>
        {/* Note */}
        {sectionData?.note && (
          <View style={styles.noteCard}>
            <Ionicons name="information-circle" size={20} color="#1E56A0" />
            <Text style={styles.noteText}>{sectionData.note}</Text>
          </View>
        )}

        {renderSectionContent()}
        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Save Button - Hidden in Read Only Mode */}
      {!isReadOnly && (
        <View style={styles.bottomBar}>
          <TouchableOpacity style={[styles.saveBtn, saving && { opacity: 0.7 }]}
            onPress={handleSave} disabled={saving} activeOpacity={0.7}>
            {saving ? <ActivityIndicator color="#fff" size="small" /> : <Ionicons name="checkmark-circle" size={20} color="#fff" />}
            <Text style={styles.saveBtnText}>{saving ? "Saving..." : "Save Section"}</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Save Success Modal */}
      <Modal visible={saveSuccess} transparent animationType="fade">
        <View style={styles.successOverlay}>
          <View style={styles.successModal}>
            <View style={styles.successIconRing}>
              <View style={styles.successIconInner}>
                <Ionicons name="checkmark" size={36} color="#fff" />
              </View>
            </View>
            <Text style={styles.successTitle}>Section Saved!</Text>
            <Text style={styles.successSubtitle}>{sectionData?.label} has been saved successfully.</Text>
            <Text style={styles.successHint}>This section is now marked as completed.</Text>
            <TouchableOpacity style={styles.successButton} onPress={() => { setSaveSuccess(false); router.back(); }} activeOpacity={0.85}>
              <Ionicons name="arrow-back" size={18} color="#fff" />
              <Text style={styles.successButtonText}>Back to Sections</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { backgroundColor: "#1E56A0", paddingTop: 50, paddingBottom: 20, paddingHorizontal: 20, flexDirection: "row", alignItems: "center" },
  backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center", marginRight: 16 },
  headerTitle: { fontSize: 20, fontWeight: "bold", color: "#fff", marginBottom: 2 },
  headerSubtitle: { fontSize: 13, color: "rgba(255,255,255,0.8)" },
  noteCard: { flexDirection: "row", backgroundColor: "#EFF6FF", borderLeftWidth: 4, borderLeftColor: "#1E56A0", padding: 16, borderRadius: 12, marginBottom: 16 },
  noteText: { flex: 1, fontSize: 13, color: "#1E40AF", marginLeft: 12, lineHeight: 18 },
  formCard: { backgroundColor: "#fff", borderRadius: 16, padding: 20, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
  fieldNote: { fontSize: 12, color: "#9CA3AF", fontStyle: "italic", marginTop: -10, marginBottom: 14 },
  fieldWrap: { marginBottom: 20 },
  fieldLabel: { fontSize: 14, fontWeight: "600", color: "#374151", marginBottom: 10 },

  // Enum buttons
  enumRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  enumBtn: { paddingVertical: 10, paddingHorizontal: 14, borderRadius: 10, backgroundColor: "#F3F4F6", borderWidth: 2, borderColor: "#E5E7EB" },
  enumBtnText: { fontSize: 13, fontWeight: "600", color: "#6B7280" },

  // Panel / Tyre cards
  panelCard: { backgroundColor: "#fff", borderRadius: 16, padding: 16, marginBottom: 12, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
  panelHeader: { flexDirection: "row", alignItems: "center", marginBottom: 16, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: "#F3F4F6" },
  panelHeaderIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: "#EFF6FF", alignItems: "center", justifyContent: "center", marginRight: 10 },
  panelTitle: { fontSize: 15, fontWeight: "700", color: "#111827" },

  // Modification section
  subSectionTitle: { fontSize: 16, fontWeight: "700", color: "#111827", marginTop: 16, marginBottom: 8 },
  addModBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: "#1E56A0", borderStyle: "dashed", borderRadius: 14, paddingVertical: 14, marginBottom: 12, gap: 8 },
  addModBtnText: { fontSize: 14, fontWeight: "700", color: "#1E56A0" },
  modModalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "flex-end" },
  modModalContent: { backgroundColor: "#fff", borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, maxHeight: "85%", paddingBottom: 48 },
  modModalHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 20 },
  modModalTitle: { fontSize: 20, fontWeight: "800", color: "#111827" },
  modModalSave: { flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: "#1E56A0", borderRadius: 16, paddingVertical: 16, gap: 8, marginTop: 8, shadowColor: "#1E56A0", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 6 },
  modModalSaveText: { fontSize: 16, fontWeight: "700", color: "#fff" },

  // Bottom save bar
  bottomBar: { backgroundColor: "#fff", paddingHorizontal: 16, paddingVertical: 12, borderTopWidth: 1, borderTopColor: "#E5E7EB", shadowColor: "#000", shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 6 },
  saveBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: "#16A34A", paddingVertical: 16, borderRadius: 16, gap: 8, shadowColor: "#16A34A", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 6 },
  saveBtnText: { fontSize: 16, fontWeight: "bold", color: "#fff" },

  // Success modal
  successOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.65)", justifyContent: "center", alignItems: "center", paddingHorizontal: 24 },
  successModal: { backgroundColor: "#fff", borderRadius: 28, padding: 32, alignItems: "center", width: "100%", shadowColor: "#000", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.18, shadowRadius: 24, elevation: 16 },
  successIconRing: { width: 96, height: 96, borderRadius: 48, backgroundColor: "#DCFCE7", alignItems: "center", justifyContent: "center", marginBottom: 20 },
  successIconInner: { width: 70, height: 70, borderRadius: 35, backgroundColor: "#16A34A", alignItems: "center", justifyContent: "center", shadowColor: "#16A34A", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 12, elevation: 8 },
  successTitle: { fontSize: 24, fontWeight: "800", color: "#111827", marginBottom: 8, letterSpacing: -0.3 },
  successSubtitle: { fontSize: 15, color: "#374151", fontWeight: "600", textAlign: "center", marginBottom: 6, lineHeight: 22 },
  successHint: { fontSize: 13, color: "#9CA3AF", textAlign: "center", marginBottom: 28 },
  successButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: "#1E56A0", paddingVertical: 16, borderRadius: 16, width: "100%", gap: 8, shadowColor: "#1E56A0", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 6 },
  successButtonText: { fontSize: 16, fontWeight: "700", color: "#fff" },
});
