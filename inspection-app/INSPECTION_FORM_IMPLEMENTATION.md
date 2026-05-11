# Inspection Form Implementation Guide

## Overview

The inspection form system is a dynamic, JSON-driven form builder that adapts based on vehicle category (2W/4W), subtype, and fuel type. This implementation follows the schema defined in `utils/reecomm_inspection_2W.json`.

## Architecture

### 1. **Vehicle Selection Flow**

**File:** `app/start-inspection.js`

The inspection starts with vehicle selection:

- **Vehicle Subtype Selection**: Motorcycle, Scooter, Moped, Electric Scooter
- **Fuel Type Selection**: Petrol, CNG, Hybrid, EV (Electric)

Based on these selections, the form dynamically determines which sections to display.

### 2. **Section Navigation**

After vehicle selection, the inspector sees a list of 10 sections:

1. **Engine & Powertrain** (or Battery & EV Powertrain for EVs)
2. **Mechanical Components**
3. **Exterior Panels**
4. **Glass & Exterior**
5. **Comfort & Electronics**
6. **Structural History**
7. **Tyres**
8. **OBD / Diagnostics**
9. **Modifications**
10. **Media & Documentation**

### 3. **Section Detail Screen**

**File:** `app/inspection-section.js`

Each section opens a dedicated screen with:

- Section title and description
- Form fields based on JSON schema
- Save functionality
- Progress tracking

### 4. **Form Field Components**

**File:** `components/inspection/FormField.js`

Reusable form components for different input types:

#### **TapButtons**

- Used for: Pass/Fail/N/A selections
- Visual feedback: Green for Pass, Red for Fail, Gray for N/A
- Example: Engine overheating, brake condition

#### **ConditionButtons**

- Used for: None/Minor/Major severity ratings
- Visual feedback: Green for None, Yellow for Minor, Red for Major
- Example: Oil leakage, rust severity

#### **SliderInput**

- Used for: Percentage values (0-100%)
- Visual feedback: Progress bar with numeric input
- Example: Battery SOH, clutch life, brake pad life

#### **NumberInput**

- Used for: Numeric values with units
- Example: Tread depth (mm), battery voltage (V)

#### **TextArea**

- Used for: Multi-line text input
- Example: Error code details, remarks

#### **MiniToggle**

- Used for: Boolean yes/no values
- Example: Original paint, repainted, rust present

#### **MediaUpload**

- Used for: Photo/video uploads
- Visual feedback: Upload button with success indicator
- Example: Engine video, chassis photo, panel photos

## Conditional Logic

### Fuel Type Based Sections

```javascript
const isEV = fuelType === "EV (Electric)";

// Show different section based on fuel type
if (isEV) {
  // Show: section_1_ev_battery
  // Fields: Battery SOH, SOC, charging port, motor noise, etc.
} else {
  // Show: section_1_engine_powertrain
  // Fields: Engine sound, oil leakage, fuel tank, carburetor, etc.
}
```

### Field-Level Conditional Display

Some fields are only shown based on other field values:

```javascript
// Example from section_8_obd_diagnostics
{
  "error_codes_present": { "type": "boolean" },
  "error_code_details": {
    "type": "string",
    "conditional_show": "error_codes_present === true"
  }
}
```

## Special Sections

### Section 3: Exterior Panels

This section uses a **repeatable panel structure**:

- Predefined panels: Front Cowl, Rear Panel, Fuel Tank Body, Side Panels, Mudguard, Under Tray
- Each panel has the same fields:
  - Original paint (toggle)
  - Repainted (toggle)
  - Dent severity (None/Minor/Moderate/Major)
  - Scratch severity (None/Minor/Moderate/Major)
  - Rust present (toggle)
  - Panel photo (media)

**Implementation TODO:**

```javascript
// Create a PanelInspection component that renders for each panel
panels.map((panelName) => (
  <PanelInspection
    key={panelName}
    panelName={panelName}
    data={formData[panelName]}
    onChange={(data) => updatePanel(panelName, data)}
  />
));
```

### Section 7: Tyres

This section uses **position-based structure**:

- Positions: Front, Rear
- Each tyre has:
  - Tread depth (mm)
  - Tyre age (years)
  - Condition (Good/Worn/Replace)
  - Tyre photo

**Implementation TODO:**

```javascript
// Create a TyreInspection component
positions.map((position) => (
  <TyreInspection
    key={position}
    position={position}
    data={formData[position]}
    onChange={(data) => updateTyre(position, data)}
  />
));
```

### Section 9: Modifications

This section has **dynamic array of modifications**:

- Summary fields: modifications_detected, modification_count, risk_level
- If modifications detected, show array of modification items
- Each modification has: category, type, is_oem, impact_on_warranty, impact_on_safety, photo, remarks

**Implementation TODO:**

```javascript
// Create a ModificationsList component
if (formData.modifications_detected) {
  <ModificationsList
    items={formData.modification_items || []}
    onAdd={() => addModification()}
    onRemove={(index) => removeModification(index)}
    onChange={(index, data) => updateModification(index, data)}
  />;
}
```

## Data Structure

### Form Data Storage

```javascript
const inspectionData = {
  // Meta information
  inspection_id: "uuid",
  vehicle_id: "vehicle_123",
  inspector_id: "inspector_456",
  vehicle_category: "2W",
  vehicle_subtype: "Scooter",
  fuel_type: "Petrol",

  // Section data
  section_1_engine_powertrain: {
    engine_sound_video: "https://cdn.../video.mp4",
    overheating: "Pass",
    oil_leakage: "Minor",
    clutch_life_percent: 75,
    // ... other fields
  },

  section_2_mechanical: {
    steering_performance: "Pass",
    brake_pad_life_percent: 60,
    // ... other fields
  },

  // ... other sections
};
```

## Scoring System

The inspection score is calculated using the **pass_ratio** method:

```javascript
score = 5 * (passed_checkpoints / total_checkpoints);
```

### Risk Mapping

- **Low Risk**: score >= 4.0 (80%+ pass rate)
- **Moderate Risk**: score >= 2.5 and < 4.0 (50-79% pass rate)
- **High Risk**: score < 2.5 (<50% pass rate)

### Checkpoint Counting

- **Pass**: Counts as passed checkpoint
- **Fail**: Counts as failed checkpoint
- **N/A**: Not counted in total
- **None** (condition): Counts as passed
- **Minor/Major** (condition): Counts as failed

## Progress Tracking

Track completion at multiple levels:

### Section Level

```javascript
const sectionProgress = {
  section_id: "section_1_engine_powertrain",
  total_fields: 20,
  completed_fields: 15,
  required_fields: 18,
  completed_required: 14,
  status: "in_progress", // not_started, in_progress, completed
};
```

### Overall Progress

```javascript
const overallProgress = {
  total_sections: 10,
  completed_sections: 3,
  total_checkpoints: 150,
  completed_checkpoints: 45,
  passed_checkpoints: 40,
  failed_checkpoints: 5,
  progress_percent: 30,
};
```

## Validation Rules

### Required Fields

- All fields marked with `"required": true` must be filled
- Media fields (photos/videos) must have uploaded content
- Cannot save section without completing required fields

### Field-Specific Validation

- **Slider/Number**: Must be within min/max range
- **Enum fields**: Must select one of the allowed values
- **Media**: Must be valid URL or file reference
- **Conditional fields**: Only validate if condition is met

## API Integration

### Save Section Data

```javascript
POST /api/inspections/{inspection_id}/sections/{section_key}
{
  "data": { /* section field data */ },
  "status": "completed",
  "completed_at": "2026-05-11T10:30:00Z"
}
```

### Submit Inspection

```javascript
POST /api/inspections/{inspection_id}/submit
{
  "status": "submitted",
  "inspection_score": 4.2,
  "total_checkpoints": 150,
  "passed_checkpoints": 126,
  "failed_checkpoints": 24,
  "overall_risk_level": "Low"
}
```

## Next Steps

### Phase 1: Core Functionality ✅

- [x] Vehicle selection screen
- [x] Section navigation screen
- [x] Basic form field components
- [x] Section detail screen

### Phase 2: Special Sections (TODO)

- [ ] Implement PanelInspection component for Section 3
- [ ] Implement TyreInspection component for Section 7
- [ ] Implement ModificationsList component for Section 9
- [ ] Handle conditional field display logic

### Phase 3: Media & Validation (TODO)

- [ ] Integrate image picker for photo uploads
- [ ] Integrate video picker for video uploads
- [ ] Implement field validation
- [ ] Show validation errors
- [ ] Prevent save if required fields missing

### Phase 4: Progress & Scoring (TODO)

- [ ] Track section completion status
- [ ] Calculate overall progress percentage
- [ ] Calculate inspection score
- [ ] Determine risk level
- [ ] Show progress indicators

### Phase 5: Data Persistence (TODO)

- [ ] Save section data to AsyncStorage
- [ ] Sync with backend API
- [ ] Handle offline mode
- [ ] Resume incomplete inspections

### Phase 6: Review & Submit (TODO)

- [ ] Create inspection review screen
- [ ] Show summary of all sections
- [ ] Allow editing before submit
- [ ] Generate PDF report
- [ ] Submit to admin for approval

## File Structure

```
inspection-app/
├── app/
│   ├── start-inspection.js          # Vehicle selection + section list
│   ├── inspection-section.js        # Section detail with form fields
│   └── inspection-review.js         # TODO: Review before submit
├── components/
│   └── inspection/
│       ├── FormField.js             # All form field components
│       ├── PanelInspection.js       # TODO: For exterior panels
│       ├── TyreInspection.js        # TODO: For tyre inspection
│       ├── ModificationsList.js     # TODO: For modifications
│       └── index.js                 # Component exports
├── utils/
│   ├── reecomm_inspection_2W.json   # 2W inspection schema
│   └── reecomm_inspection_4W.json   # TODO: 4W inspection schema
└── services/
    └── api/
        └── inspectionAPI.js         # API calls for inspections
```

## Testing Checklist

- [ ] Vehicle selection works for all subtypes
- [ ] Vehicle selection works for all fuel types
- [ ] EV vehicles show Battery section instead of Engine section
- [ ] All form field types render correctly
- [ ] Form field values update on change
- [ ] Save button saves section data
- [ ] Back button preserves unsaved changes (with warning)
- [ ] Required field validation works
- [ ] Conditional fields show/hide correctly
- [ ] Media upload opens picker
- [ ] Progress tracking updates correctly
- [ ] Score calculation is accurate
- [ ] Submit button validates all sections
- [ ] Offline mode works
- [ ] Data syncs when online

## Design Patterns

### Component Reusability

All form fields are reusable components with consistent props:

```javascript
<FormFieldComponent
  label="Field Label"
  value={currentValue}
  onChange={(newValue) => updateField(fieldName, newValue)}
  required={isRequired}
/>
```

### Data Flow

1. User selects vehicle type → determines sections to show
2. User opens section → loads section schema from JSON
3. User fills fields → updates local state
4. User saves section → persists to storage/API
5. User completes all sections → calculates score
6. User submits inspection → sends to admin

### Error Handling

- Show inline validation errors below fields
- Highlight required fields that are empty
- Show toast messages for save success/failure
- Handle network errors gracefully
- Preserve data on app crash/close

## Styling Guidelines

- **Primary Color**: #1E56A0 (Blue)
- **Success Color**: #16A34A (Green)
- **Warning Color**: #F59E0B (Yellow/Orange)
- **Error Color**: #DC2626 (Red)
- **Background**: #F9FAFB (Light Gray)
- **Card Background**: #FFFFFF (White)
- **Border Radius**: 16px for cards, 12px for buttons/inputs
- **Shadow**: Subtle elevation for cards and buttons
- **Typography**: Bold for titles, semibold for labels, regular for body text
