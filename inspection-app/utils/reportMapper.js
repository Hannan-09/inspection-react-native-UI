import AsyncStorage from "@react-native-async-storage/async-storage";

const normalizeEnum = (val) => {
  if (!val) return null;
  if (val === "NA") return "N/A";
  if (val === "NONE") return "None";
  return val.charAt(0).toUpperCase() + val.slice(1).toLowerCase();
};

export const mapReportToSectionState = (report, key, category) => {
  if (key === "section_1_engine_powertrain") {
    const s = report.engineAndPowertrain || {};
    if (category === "2W") {
      return {
        engine_sound_video: s.engineSoundVideo || null,
        overheating: normalizeEnum(s.overheating),
        misfiring_smoke: normalizeEnum(s.misfiringSmoke),
        back_compression: normalizeEnum(s.backCompression),
        oil_leakage: normalizeEnum(s.oilLeakage),
        coolant_leakage: normalizeEnum(s.coolantLeakage),
        engine_mount_condition: normalizeEnum(s.engineMountCondition),
        exhaust_leaks: normalizeEnum(s.exhaustLeaks),
        fuel_lines: normalizeEnum(s.fuelLines),
        fuel_tank: normalizeEnum(s.fuelTank),
        gaskets_and_seals: normalizeEnum(s.gasketsAndSeals),
        wiring_harness: normalizeEnum(s.wiringHarness),
        wiring_harness_photo: s.wiringHarnessPhoto || null,
        battery_voltage: normalizeEnum(s.batteryVoltage),
        battery_voltage_value: s.batteryVoltageValue?.toString() || "",
        alternator_starter: normalizeEnum(s.alternatorStarter),
        gear_shifting: normalizeEnum(s.gearShifting),
        gearbox_leaks: normalizeEnum(s.gearboxLeaks),
        clutch_life_percent: s.clutchLifePercent !== undefined && s.clutchLifePercent !== null ? s.clutchLifePercent : "",
        exhaust_condition: normalizeEnum(s.exhaustCondition),
        carburetor_or_injector: normalizeEnum(s.carburetorOrInjector),
        battery_and_voltage: normalizeEnum(s.batteryAndVoltage),
        self_start_functioning: normalizeEnum(s.selfStartFunctioning),
        chain_sprocket_condition: normalizeEnum(s.chainSprocketCondition),
        clutch_condition: normalizeEnum(s.clutchCondition)
      };
    }
    return {
      engine_sound_video: s.engineSoundVideo || null,
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
      wiring_harness_photo: s.wiringHarnessPhoto || null,
      battery_voltage: normalizeEnum(s.batteryVoltage),
      battery_voltage_value: s.batteryVoltageValue?.toString() || "",
      alternator_starter: normalizeEnum(s.alternatorStarter),
      gear_shifting: normalizeEnum(s.gearShifting),
      gearbox_leaks: normalizeEnum(s.gearboxLeaks),
      clutch_life_percent: s.clutchLifePercent !== undefined && s.clutchLifePercent !== null ? s.clutchLifePercent : "",
      drive_shaft_axle: normalizeEnum(s.driveShaftAxle)
    };
  }
  if (key === "section_1_ev_battery") {
    const s = report.evBattery || {};
    return {
      motor_running_video: s.motorRunningVideo || null,
      battery_soh_percent: s.batterySohPercent !== undefined && s.batterySohPercent !== null ? s.batterySohPercent : "",
      battery_soc_percent: s.batterySocPercent !== undefined && s.batterySocPercent !== null ? s.batterySocPercent : "",
      battery_pack_condition: normalizeEnum(s.batteryPackCondition),
      battery_thermal_cooling: normalizeEnum(s.batteryThermalCooling),
      charging_port_condition: normalizeEnum(s.chargingPortCondition),
      charging_port_condition_photo: s.chargingPortPhoto || null,
      bms_warning_light: normalizeEnum(s.bmsWarningLight),
      range_indicator_functional: normalizeEnum(s.rangeIndicatorFunctional),
      motor_noise_vibration: normalizeEnum(s.motorNoiseVibration),
      regenerative_braking_active: normalizeEnum(s.regenerativeBrakingActive),
      hv_wiring_harness: normalizeEnum(s.hvWiringHarness),
      hv_wiring_harness_photo: s.hvWiringHarnessPhoto || null,
      dc_dc_converter: normalizeEnum(s.dcDcConverter),
      onboard_charger_status: normalizeEnum(s.onboardChargerStatus)
    };
  }
  if (key === "section_2_mechanical") {
    const s = report.mechanical || {};
    if (category === "2W") {
      return {
        steering_performance: normalizeEnum(s.steeringPerformance),
        front_fork_condition: normalizeEnum(s.frontForkCondition),
        rear_shock_condition: normalizeEnum(s.rearShockCondition),
        rear_shock_condition_photo: s.rearShockConditionPhoto || null,
        swingarm_bushings: normalizeEnum(s.swingarmBushings),
        suspension_noise: normalizeEnum(s.suspensionNoise),
        front_brake_condition: normalizeEnum(s.frontBrakeCondition),
        front_brake_condition_photo: s.frontBrakeConditionPhoto || null,
        rear_brake_condition: normalizeEnum(s.rearBrakeCondition),
        brake_pad_life_percent: s.brakePadLifePercent !== undefined && s.brakePadLifePercent !== null ? s.brakePadLifePercent : "",
        brake_cables_or_lines: normalizeEnum(s.brakeCablesOrLines)
      };
    }
    return {
      steering_performance: normalizeEnum(s.steeringPerformance),
      steering_rack_leakage: normalizeEnum(s.steeringRackLeakage),
      shocks_struts: normalizeEnum(s.shocksStruts),
      shocks_struts_photo: s.shocksStrutsPhoto || null,
      ball_joints_bushes: normalizeEnum(s.ballJointsBushes),
      suspension_noise: normalizeEnum(s.suspensionNoise),
      disc_drum_brake_condition: normalizeEnum(s.discDrumBrakeCondition),
      disc_drum_brake_condition_photo: s.discDrumBrakePhoto || null,
      brake_pad_life_percent: s.brakePadLifePercent !== undefined && s.brakePadLifePercent !== null ? s.brakePadLifePercent : "",
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
        panel_photo: p.panelPhoto || null
      };
    });
    return panels;
  }
  if (key === "section_4_glass_exterior_electronics") {
    const s = report.glassAndExteriorElectronics || {};
    if (category === "2W") {
      return {
        headlight_condition: normalizeEnum(s.headlightCondition),
        tail_light_indicators: normalizeEnum(s.tailLightIndicators),
        speedometer_cluster: normalizeEnum(s.speedometerCluster),
        mirrors: normalizeEnum(s.mirrors),
        visor_windshield: normalizeEnum(s.visorWindshield)
      };
    }
    return {
      glass_scratches: normalizeEnum(s.glassScratches),
      glass_cracks_chips: normalizeEnum(s.glassCracksChips),
      glass_cracks_chips_photo: s.glassCracksChipsPhoto || null,
      side_mirrors: normalizeEnum(s.sideMirrors),
      parking_sensors: normalizeEnum(s.parkingSensors),
      exterior_lights_all: normalizeEnum(s.exteriorLightsAll),
      wipers_washers: normalizeEnum(s.wipersWashers),
      headlight: normalizeEnum(s.headlight),
      fog_lamp: normalizeEnum(s.fogLamp),
      tail_light: normalizeEnum(s.tailLight),
      front_wiper: normalizeEnum(s.frontWiper),
      rear_wiper: normalizeEnum(s.rearWiper),
      rear_windshield: normalizeEnum(s.rearWindshield),
      rear_windshield_photo: s.rearWindshieldPhoto || null
    };
  }
  if (key === "section_5_interior_cabin" || key === "section_5_comfort_electronics") {
    const s = report.interiorAndCabin || report.comfortAndElectronics || {};
    if (category === "2W") {
      return {
        horn: normalizeEnum(s.horn),
        usb_charging_port: normalizeEnum(s.usbChargingPort),
        instrument_cluster_display: normalizeEnum(s.instrumentClusterDisplay),
        mobile_connectivity_tft: normalizeEnum(s.mobileConnectivityTft),
        seat_condition: normalizeEnum(s.seatCondition),
        grab_rail_pillion: normalizeEnum(s.grabRailPillion),
        storage_box_underseat: normalizeEnum(s.storageBoxUnderseat)
      };
    }
    return {
      ac_cooling: normalizeEnum(s.acCooling),
      ac_heating: normalizeEnum(s.acHeating),
      ac_compressor: normalizeEnum(s.acCompressor),
      ac_gas_leakage: normalizeEnum(s.acGasLeakage),
      hvac_climate_control: normalizeEnum(s.hvacClimateControl),
      speakers: normalizeEnum(s.speakers),
      infotainment_system: normalizeEnum(s.infotainmentSystem),
      ventilated_seat: normalizeEnum(s.ventilatedSeat),
      back_camera: normalizeEnum(s.backCamera),
      camera_360: normalizeEnum(s.camera360),
      cruise_control: normalizeEnum(s.cruiseControl),
      interior_lights: normalizeEnum(s.interiorLights),
      central_locking: normalizeEnum(s.centralLocking),
      power_windows_all: normalizeEnum(s.powerWindowsAll),
      manual_power_windows_count: s.manualPowerWindowCount !== undefined && s.manualPowerWindowCount !== null ? s.manualPowerWindowCount : "",
      reverse_camera_sensors: normalizeEnum(s.reverseCameraSensors),
      seat_condition: normalizeEnum(s.seatCondition),
      dashboard_condition: normalizeEnum(s.dashboardCondition),
      water_flood_damage_signs: normalizeEnum(s.waterFloodDamageSigns),
      water_flood_damage_signs_photo: s.waterFloodDamagePhoto || null
    };
  }
  if (key === "section_6_structural_history") {
    const s = report.structuralHistory || {};
    if (category === "2W") {
      return {
        frame_condition: normalizeEnum(s.frameCondition),
        frame_condition_photo: s.frameConditionPhoto || null,
        accident_repair_visible: normalizeEnum(s.accidentRepairVisible),
        flood_damage_confirmed: normalizeEnum(s.floodDamageConfirmed),
        chassis_number_intact: normalizeEnum(s.chassisNumberIntact),
        chassis_number_intact_photo: s.chassisNumberIntactPhoto || null,
        engine_number_intact: normalizeEnum(s.engineNumberIntact),
        engine_number_intact_photo: s.engineNumberIntactPhoto || null
      };
    }
    return {
      structural_damage: normalizeEnum(s.structuralDamage),
      structural_damage_photo: s.structuralDamagePhoto || null,
      flood_damage_confirmed: normalizeEnum(s.floodDamageConfirmed),
      underbody_condition: normalizeEnum(s.underbodyCondition),
      underbody_condition_photo: s.underbodyConditionPhoto || null,
      chassis_alignment: normalizeEnum(s.chassisAlignment)
    };
  }
  if (key === "section_7_tyres") {
    const s = report.tyres || {};
    if (category === "2W") {
      return {
        "Front": {
          tread_depth_mm: s.frontTreadDepthMm !== undefined && s.frontTreadDepthMm !== null ? s.frontTreadDepthMm : "",
          tyre_age_years: s.frontTyreAgeYears !== undefined && s.frontTyreAgeYears !== null ? s.frontTyreAgeYears : "",
          condition: normalizeEnum(s.frontTyreCondition),
          tyre_photo: s.frontTyrePhoto || null
        },
        "Rear": {
          tread_depth_mm: s.rearTreadDepthMm !== undefined && s.rearTreadDepthMm !== null ? s.rearTreadDepthMm : "",
          tyre_age_years: s.rearTyreAgeYears !== undefined && s.rearTyreAgeYears !== null ? s.rearTyreAgeYears : "",
          condition: normalizeEnum(s.rearTyreCondition),
          tyre_photo: s.rearTyrePhoto || null
        }
      };
    }
    return {
      "Front Left": {
        tread_depth_mm: s.frontLeftTreadDepthMm !== undefined && s.frontLeftTreadDepthMm !== null ? s.frontLeftTreadDepthMm : "",
        tyre_age_years: s.frontLeftTyreAgeYears !== undefined && s.frontLeftTyreAgeYears !== null ? s.frontLeftTyreAgeYears : "",
        condition: normalizeEnum(s.frontLeftTyreCondition),
        tyre_photo: s.frontLeftTyrePhoto || null
      },
      "Front Right": {
        tread_depth_mm: s.frontRightTreadDepthMm !== undefined && s.frontRightTreadDepthMm !== null ? s.frontRightTreadDepthMm : "",
        tyre_age_years: s.frontRightTyreAgeYears !== undefined && s.frontRightTyreAgeYears !== null ? s.frontRightTyreAgeYears : "",
        condition: normalizeEnum(s.frontRightTyreCondition),
        tyre_photo: s.frontRightTyrePhoto || null
      },
      "Rear Left": {
        tread_depth_mm: s.rearLeftTreadDepthMm !== undefined && s.rearLeftTreadDepthMm !== null ? s.rearLeftTreadDepthMm : "",
        tyre_age_years: s.rearLeftTyreAgeYears !== undefined && s.rearLeftTyreAgeYears !== null ? s.rearLeftTyreAgeYears : "",
        condition: normalizeEnum(s.rearLeftTyreCondition),
        tyre_photo: s.rearLeftTyrePhoto || null
      },
      "Rear Right": {
        tread_depth_mm: s.rearRightTreadDepthMm !== undefined && s.rearRightTreadDepthMm !== null ? s.rearRightTreadDepthMm : "",
        tyre_age_years: s.rearRightTyreAgeYears !== undefined && s.rearRightTyreAgeYears !== null ? s.rearRightTyreAgeYears : "",
        condition: normalizeEnum(s.rearRightTyreCondition),
        tyre_photo: s.rearRightTyrePhoto || null
      },
      spare_tyre_condition: normalizeEnum(s.spareTyreCondition)
    };
  }
  if (key === "section_8_obd_diagnostics") {
    const s = report.obdDiagnostics || {};
    return {
      obd_scan_done: normalizeEnum(s.obdScanDone),
      error_codes_present: s.errorCodesPresent === true,
      error_code_details: s.errorCodeDetails || "",
      error_codes_present_photo: s.errorCodesPhoto || null,
      emission_status: normalizeEnum(s.emissionStatus)
    };
  }
  if (key === "section_9_modifications") {
    const s = report.modifications || {};
    return {
      modifications_detected: s.modificationsDetected === true,
      modification_count: s.modificationCount !== undefined && s.modificationCount !== null ? s.modificationCount : "",
      modification_risk_level: normalizeEnum(s.modificationRiskLevel),
      seller_declaration_match: s.sellerDeclarationMatch === true,
      modification_items: (s.modificationItems || []).map(m => ({
        modification_category: m.modificationCategory || "",
        modification_type: m.modificationType || "",
        is_oem: m.isOem === true,
        impact_on_warranty: normalizeEnum(m.impactOnWarranty),
        impact_on_safety: normalizeEnum(m.impactOnSafety),
        documentation_available: m.documentationAvailable === true,
        photo: m.photo || null,
        remarks: m.remarks || ""
      }))
    };
  }
  if (key === "section_10_media") {
    const s = report.media || {};
    return {
      engine_or_motor_running_video: s.engineOrMotorRunningVideo || null,
      test_drive_video: s.testDriveVideo || null,
      test_ride_video: s.testRideVideo || null,
      underbody_photos: s.underbodyPhotos || [],
      major_dent_photos: s.majorDentPhotos || [],
      chassis_number_photo: s.chassisNumberPhoto || null,
      engine_number_photo: s.engineNumberPhoto || null,
      full_vehicle_walkaround_photos: s.fullVehicleWalkaroundPhotos || []
    };
  }
  if (key === "section_11_vehicle_specs") {
    const s = report.vehicleSpecs || {};
    return {
      chassis_no: s.chassisNo || "",
      engine_no: s.engineNo || "",
      owner_count: s.ownerCount !== undefined && s.ownerCount !== null ? s.ownerCount : "",
      reg_date: s.regDate || "",
      rc_upto_date: s.rcUptoDate || "",
      vehicle_tax_upto_date: s.vehicleTaxUptoDate || "",
      insurance_upto_date: s.insuranceUptoDate || "",
      vehicle_cc: s.vehicleCc !== undefined && s.vehicleCc !== null ? s.vehicleCc : "",
      vehicle_gross_weight: s.vehicleGrossWeight !== undefined && s.vehicleGrossWeight !== null ? s.vehicleGrossWeight : "",
      vehicle_cylinder: s.vehicleCylinder !== undefined && s.vehicleCylinder !== null ? s.vehicleCylinder : "",
      puc_no: s.pucNo || "",
      puc_upto_date: s.pucUptoDate || "",
      blacklist_details: s.blacklistDetails || [],
      challan_details: s.challanDetails || [],
      permit_no: s.permitNo || "",
      permit_type: s.permitType || "",
      permit_from_date: s.permitFromDate || "",
      permit_to_date: s.permitToDate || "",
      national_permit_no: s.nationalPermitNo || "",
      national_permit_upto_date: s.nationalPermitUptoDate || "",
      rto_code: s.rtoCode || ""
    };
  }
  return {};
};

/**
 * Downloads and populates all relevant inspection sections in AsyncStorage using GET_REPORT data.
 * This effectively restores form state from DB so inspector can edit a submitted report.
 */
export const populateInspectionStorage = async (inspectionAPI, inspectionId, category, fuelType) => {
  try {
    const res = await inspectionAPI.getInspectionReport(inspectionId, category);
    const report = res.data || res;
    if (!report) {
      throw new Error("Empty report response from server");
    }

    const isEV = (fuelType || report.fuelType || "").toUpperCase().includes("ELECTRIC") || 
                 (fuelType || report.fuelType || "").toUpperCase() === "EV";
    const is4W = category === "4W";

    const sections = [
      { key: isEV ? "section_1_ev_battery" : "section_1_engine_powertrain" },
      { key: "section_2_mechanical" },
      { key: "section_3_exterior_panels" },
      { key: "section_4_glass_exterior_electronics" },
      { key: is4W ? "section_5_interior_cabin" : "section_5_comfort_electronics" },
      { key: "section_6_structural_history" },
      { key: "section_7_tyres" },
      ...(!isEV ? [{ key: "section_8_obd_diagnostics" }] : []),
      { key: "section_9_modifications" },
      { key: "section_10_media" },
      { key: "section_11_vehicle_specs" }
    ];

    const progress = {};
    const storageKeys = [];
    const storagePairs = [];

    for (const section of sections) {
      const stateData = mapReportToSectionState(report, section.key, category);
      progress[section.key] = "completed";
      
      const storageKey = `inspection_${inspectionId}_${section.key}`;
      storageKeys.push(storageKey);
      storagePairs.push([storageKey, JSON.stringify(stateData)]);
    }

    const progressKey = `inspection_${inspectionId}_progress`;
    storagePairs.push([progressKey, JSON.stringify(progress)]);

    await AsyncStorage.multiSet(storagePairs);
    console.log(`Successfully populated storage for inspection ID: ${inspectionId}`);
    return true;
  } catch (error) {
    console.error("Error pre-populating AsyncStorage:", error);
    throw error;
  }
};
