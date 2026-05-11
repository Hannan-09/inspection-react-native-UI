# Inspection Form Admin Panel - Architecture & CRUD Design

## Overview

This document outlines the database schema and admin panel CRUD operations for managing dynamic inspection forms for 2-wheeler and 4-wheeler vehicles.

---

## 1. Database Schema Design

### 1.1 Core Tables

#### **Table: `vehicle_categories`**

Stores main vehicle types.

```sql
CREATE TABLE vehicle_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(10) UNIQUE NOT NULL, -- '2W', '4W'
  name VARCHAR(50) NOT NULL, -- '2 Wheeler', '4 Wheeler'
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### **Table: `vehicle_subtypes`**

Stores vehicle subtypes for each category.

```sql
CREATE TABLE vehicle_subtypes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID REFERENCES vehicle_categories(id) ON DELETE CASCADE,
  code VARCHAR(50) NOT NULL, -- 'Motorcycle', 'Scooter', 'Sedan', 'SUV'
  name VARCHAR(100) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(category_id, code)
);
```

#### **Table: `fuel_types`**

Stores all fuel types.

```sql
CREATE TABLE fuel_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(50) NOT NULL UNIQUE, -- 'Petrol', 'Diesel', 'EV', 'Hybrid', 'CNG'
  name VARCHAR(100) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

### 1.2 Inspection Form Structure Tables

#### **Table: `inspection_form_templates`**

Master template for each vehicle category + subtype + fuel type combination.

```sql
CREATE TABLE inspection_form_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID REFERENCES vehicle_categories(id),
  subtype_id UUID REFERENCES vehicle_subtypes(id),
  fuel_type_id UUID REFERENCES fuel_types(id),

  template_name VARCHAR(200) NOT NULL, -- 'Motorcycle - Petrol Inspection'
  template_code VARCHAR(100) UNIQUE NOT NULL, -- '2W_MOTORCYCLE_PETROL'
  version VARCHAR(20) DEFAULT '1.0',

  is_active BOOLEAN DEFAULT true,
  is_published BOOLEAN DEFAULT false,

  created_by UUID, -- FK to admin users
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(category_id, subtype_id, fuel_type_id)
);
```

#### **Table: `inspection_sections`**

Reusable sections (e.g., "Engine & Powertrain", "Mechanical Components").

```sql
CREATE TABLE inspection_sections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  section_code VARCHAR(100) UNIQUE NOT NULL, -- 'section_1_engine_powertrain'
  section_name VARCHAR(200) NOT NULL, -- 'Engine & Powertrain'
  section_order INTEGER NOT NULL, -- Display order
  description TEXT,

  -- Applicability rules
  applicable_categories JSONB, -- ['2W', '4W']
  applicable_fuel_types JSONB, -- ['Petrol', 'CNG', 'Hybrid']

  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### **Table: `template_sections`**

Links sections to templates (many-to-many with ordering).

```sql
CREATE TABLE template_sections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_id UUID REFERENCES inspection_form_templates(id) ON DELETE CASCADE,
  section_id UUID REFERENCES inspection_sections(id) ON DELETE CASCADE,

  section_order INTEGER NOT NULL, -- Order within this template
  is_required BOOLEAN DEFAULT true,
  is_visible BOOLEAN DEFAULT true,

  created_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(template_id, section_id)
);
```

#### **Table: `inspection_fields`**

Reusable form fields.

```sql
CREATE TABLE inspection_fields (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  field_code VARCHAR(100) UNIQUE NOT NULL, -- 'overheating', 'oil_leakage'
  field_label VARCHAR(200) NOT NULL, -- 'Overheating', 'Oil Leakage'
  field_type VARCHAR(50) NOT NULL, -- 'tap_buttons', 'slider', 'media_url', 'textarea'

  -- Field configuration
  input_config JSONB, -- { "enum": ["Pass", "Fail", "N/A"], "min": 0, "max": 100, "unit": "%" }

  validation_rules JSONB, -- { "required": true, "photo_required_on_fail": true }

  description TEXT,
  help_text TEXT,

  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### **Table: `section_fields`**

Links fields to sections (many-to-many with ordering).

```sql
CREATE TABLE section_fields (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  section_id UUID REFERENCES inspection_sections(id) ON DELETE CASCADE,
  field_id UUID REFERENCES inspection_fields(id) ON DELETE CASCADE,

  field_order INTEGER NOT NULL, -- Order within section
  is_required BOOLEAN DEFAULT false,
  is_conditional BOOLEAN DEFAULT false,
  conditional_logic JSONB, -- { "show_if": "error_codes_present === true" }

  created_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(section_id, field_id)
);
```

---

### 1.3 Special Handling Tables

#### **Table: `panel_inspection_config`**

For section_3_exterior_panels (repeatable panel inspection).

```sql
CREATE TABLE panel_inspection_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_id UUID REFERENCES inspection_form_templates(id) ON DELETE CASCADE,

  panel_names JSONB NOT NULL, -- ['Front Cowl', 'Rear Panel', 'Fuel Tank Body']
  per_panel_fields JSONB NOT NULL, -- Field definitions for each panel

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### **Table: `tyre_inspection_config`**

For section_7_tyres (repeatable tyre inspection).

```sql
CREATE TABLE tyre_inspection_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_id UUID REFERENCES inspection_form_templates(id) ON DELETE CASCADE,

  tyre_positions JSONB NOT NULL, -- ['Front', 'Rear'] for 2W, ['FL', 'FR', 'RL', 'RR'] for 4W
  per_tyre_fields JSONB NOT NULL, -- Field definitions for each tyre

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## 2. Admin Panel CRUD Operations

### 2.1 Master Data Management

#### **A. Vehicle Categories**

- **List**: View all categories (2W, 4W)
- **Create**: Add new category
- **Edit**: Update category details
- **Activate/Deactivate**: Toggle is_active

#### **B. Vehicle Subtypes**

- **List**: View subtypes grouped by category
- **Create**: Add subtype to a category
- **Edit**: Update subtype details
- **Activate/Deactivate**: Toggle is_active

#### **C. Fuel Types**

- **List**: View all fuel types
- **Create**: Add new fuel type
- **Edit**: Update fuel type details
- **Activate/Deactivate**: Toggle is_active

---

### 2.2 Section Library Management

#### **Inspection Sections**

Admin can create reusable sections.

**Create Section:**

```json
{
  "section_code": "section_1_engine_powertrain",
  "section_name": "Engine & Powertrain",
  "section_order": 1,
  "description": "Comprehensive engine inspection",
  "applicable_categories": ["2W", "4W"],
  "applicable_fuel_types": ["Petrol", "CNG", "Hybrid"]
}
```

**UI Features:**

- Drag-and-drop to reorder sections
- Multi-select for applicable categories and fuel types
- Clone existing section for quick creation

---

### 2.3 Field Library Management

#### **Inspection Fields**

Admin can create reusable fields.

**Create Field:**

```json
{
  "field_code": "overheating",
  "field_label": "Overheating",
  "field_type": "tap_buttons",
  "input_config": {
    "enum": ["Pass", "Fail", "N/A"]
  },
  "validation_rules": {
    "required": true
  },
  "description": "Check for engine overheating"
}
```

**Field Types Supported:**

- `tap_buttons`: Pass/Fail/N/A buttons
- `condition_buttons`: None/Minor/Major buttons
- `slider`: Percentage or numeric slider
- `number_input`: Numeric input
- `textarea`: Multi-line text
- `media_url`: Photo/video upload
- `mini_toggle`: Boolean toggle
- `mini_buttons`: Small button group

**UI Features:**

- Field type selector with preview
- JSON editor for advanced config
- Validation rule builder

---

### 2.4 Template Builder (Main CRUD)

#### **Step 1: Create Template**

Admin selects:

1. Vehicle Category (2W/4W)
2. Vehicle Subtype (Motorcycle, Scooter, etc.)
3. Fuel Type (Petrol, EV, etc.)

System auto-generates:

- `template_code`: `2W_MOTORCYCLE_PETROL`
- `template_name`: `Motorcycle - Petrol Inspection`

#### **Step 2: Add Sections to Template**

Admin sees:

- **Available Sections** (filtered by applicable_categories and applicable_fuel_types)
- **Selected Sections** (drag-and-drop to reorder)

**UI:**

```
┌─────────────────────────────────────────────────┐
│ Available Sections          Selected Sections   │
├─────────────────────────────────────────────────┤
│ □ Engine & Powertrain  →    1. Engine & Power  │
│ □ Mechanical           →    2. Mechanical       │
│ □ Exterior Panels      →    3. Tyres            │
│ □ Tyres                                         │
└─────────────────────────────────────────────────┘
```

#### **Step 3: Configure Section Fields**

For each selected section, admin can:

- View default fields from `section_fields`
- Add/remove fields
- Reorder fields
- Mark fields as required/optional
- Set conditional logic

**UI:**

```
Section: Engine & Powertrain
┌─────────────────────────────────────────────────┐
│ Field                    Type          Required │
├─────────────────────────────────────────────────┤
│ ☰ Engine Sound Video    media_url     ✓        │
│ ☰ Overheating           tap_buttons   ✓        │
│ ☰ Oil Leakage           condition     ✓        │
│ ☰ Battery Voltage       number        ☐        │
└─────────────────────────────────────────────────┘
```

#### **Step 4: Configure Special Sections**

**For Exterior Panels:**

- Define panel names (Front Cowl, Rear Panel, etc.)
- Configure per-panel fields

**For Tyres:**

- Define positions (Front/Rear for 2W, FL/FR/RL/RR for 4W)
- Configure per-tyre fields

#### **Step 5: Publish Template**

- Preview full form
- Validate all required fields
- Set `is_published = true`

---

## 3. Template Reusability Strategy

### 3.1 Common Sections Across Templates

Many sections are shared across multiple templates:

**Example:**

- `section_2_mechanical` → Used in ALL 2W templates
- `section_7_tyres` → Used in ALL templates (2W & 4W)
- `section_6_structural_history` → Used in ALL templates

**Admin Workflow:**

1. Create section once in Section Library
2. Reuse in multiple templates
3. If section is updated, all templates using it are affected

### 3.2 Template Cloning

Admin can clone an existing template:

- Clone `2W_MOTORCYCLE_PETROL` → `2W_MOTORCYCLE_HYBRID`
- Modify only the differences (e.g., add hybrid-specific fields)

---

## 4. API Endpoints for Admin Panel

### 4.1 Master Data APIs

```
GET    /api/admin/vehicle-categories
POST   /api/admin/vehicle-categories
PUT    /api/admin/vehicle-categories/:id
DELETE /api/admin/vehicle-categories/:id

GET    /api/admin/vehicle-subtypes
POST   /api/admin/vehicle-subtypes
PUT    /api/admin/vehicle-subtypes/:id
DELETE /api/admin/vehicle-subtypes/:id

GET    /api/admin/fuel-types
POST   /api/admin/fuel-types
PUT    /api/admin/fuel-types/:id
DELETE /api/admin/fuel-types/:id
```

### 4.2 Section & Field Library APIs

```
GET    /api/admin/sections
POST   /api/admin/sections
PUT    /api/admin/sections/:id
DELETE /api/admin/sections/:id

GET    /api/admin/fields
POST   /api/admin/fields
PUT    /api/admin/fields/:id
DELETE /api/admin/fields/:id

POST   /api/admin/sections/:id/fields (Link field to section)
DELETE /api/admin/sections/:id/fields/:fieldId (Unlink)
```

### 4.3 Template Builder APIs

```
GET    /api/admin/templates
GET    /api/admin/templates/:id
POST   /api/admin/templates
PUT    /api/admin/templates/:id
DELETE /api/admin/templates/:id

POST   /api/admin/templates/:id/sections (Add section to template)
DELETE /api/admin/templates/:id/sections/:sectionId (Remove)
PUT    /api/admin/templates/:id/sections/reorder (Reorder sections)

POST   /api/admin/templates/:id/publish (Publish template)
POST   /api/admin/templates/:id/clone (Clone template)

GET    /api/admin/templates/:id/preview (Preview full form JSON)
```

---

## 5. Mobile App Integration

### 5.1 Fetch Template API

When inspector starts inspection:

```
GET /api/inspector/inspection-template?category=2W&subtype=Motorcycle&fuelType=Petrol
```

**Response:**

```json
{
  "template_id": "uuid",
  "template_code": "2W_MOTORCYCLE_PETROL",
  "template_name": "Motorcycle - Petrol Inspection",
  "version": "1.0",
  "sections": [
    {
      "section_id": "uuid",
      "section_code": "section_1_engine_powertrain",
      "section_name": "Engine & Powertrain",
      "section_order": 1,
      "fields": [
        {
          "field_id": "uuid",
          "field_code": "overheating",
          "field_label": "Overheating",
          "field_type": "tap_buttons",
          "input_config": { "enum": ["Pass", "Fail", "N/A"] },
          "is_required": true,
          "field_order": 1
        }
      ]
    }
  ],
  "panel_config": { ... },
  "tyre_config": { ... }
}
```

### 5.2 Submit Inspection API

```
POST /api/inspector/inspections/:id/submit
```

**Payload:**

```json
{
  "template_id": "uuid",
  "inspection_data": {
    "section_1_engine_powertrain": {
      "overheating": "Pass",
      "oil_leakage": "Minor",
      "engine_sound_video": "https://cdn.../video.mp4"
    },
    "section_2_mechanical": { ... }
  },
  "inspection_score": 4.2,
  "overall_risk_level": "Low"
}
```

---

## 6. Admin Panel UI Mockup

### 6.1 Template List Page

```
┌────────────────────────────────────────────────────────────┐
│ Inspection Form Templates                    [+ New]       │
├────────────────────────────────────────────────────────────┤
│ Filter: [2W ▼] [All Subtypes ▼] [All Fuel Types ▼]       │
├────────────────────────────────────────────────────────────┤
│ Template Name              Status    Version   Actions     │
├────────────────────────────────────────────────────────────┤
│ Motorcycle - Petrol        ✓ Active  v1.0     Edit Clone   │
│ Motorcycle - EV            ✓ Active  v1.0     Edit Clone   │
│ Scooter - Petrol           ⊗ Draft   v1.0     Edit Delete  │
└────────────────────────────────────────────────────────────┘
```

### 6.2 Template Builder Page

```
┌────────────────────────────────────────────────────────────┐
│ Create Template: Motorcycle - Petrol Inspection           │
├────────────────────────────────────────────────────────────┤
│ Step 1: Basic Info                                         │
│ Category: [2W ▼]  Subtype: [Motorcycle ▼]  Fuel: [Petrol ▼]│
├────────────────────────────────────────────────────────────┤
│ Step 2: Add Sections                                       │
│ [Available Sections]  →  [Selected Sections (Drag to order)]│
├────────────────────────────────────────────────────────────┤
│ Step 3: Configure Fields (per section)                     │
│ Section: Engine & Powertrain                               │
│ [Field list with drag-and-drop ordering]                   │
├────────────────────────────────────────────────────────────┤
│ [Save Draft]  [Preview]  [Publish]                         │
└────────────────────────────────────────────────────────────┘
```

---

## 7. Implementation Phases

### Phase 1: Master Data Setup

- Create vehicle categories, subtypes, fuel types
- Seed initial data

### Phase 2: Section & Field Library

- Build section CRUD
- Build field CRUD
- Link fields to sections

### Phase 3: Template Builder

- Template CRUD
- Section assignment
- Field configuration
- Special section handling (panels, tyres)

### Phase 4: Mobile App Integration

- Fetch template API
- Dynamic form rendering
- Submit inspection API

### Phase 5: Advanced Features

- Template versioning
- Template cloning
- Bulk operations
- Analytics dashboard

---

## 8. Key Benefits of This Architecture

✅ **Reusability**: Sections and fields are reusable across templates
✅ **Flexibility**: Easy to add new vehicle types or fuel types
✅ **Maintainability**: Update a section once, affects all templates
✅ **Scalability**: Can handle 100+ template combinations
✅ **Version Control**: Track template versions
✅ **Dynamic**: Mobile app fetches latest template structure
✅ **No Code Changes**: Admin can modify forms without developer intervention

---

## 9. Example: Creating a New Template

**Scenario**: Admin wants to create "Electric Scooter - EV" inspection form.

**Steps:**

1. Go to Templates → Create New
2. Select: Category=2W, Subtype=Electric Scooter, Fuel=EV
3. System shows applicable sections (filters out engine sections, shows EV battery section)
4. Admin selects:
   - Section 1: Battery & EV Powertrain ✓
   - Section 2: Mechanical Components ✓
   - Section 3: Exterior Panels ✓
   - Section 7: Tyres ✓
5. For each section, admin reviews/modifies fields
6. Configure panel names and tyre positions
7. Preview form
8. Publish

**Result**: Mobile app can now fetch this template when inspector selects Electric Scooter + EV.

---

## 10. Conclusion

This architecture provides a **flexible, scalable, and maintainable** solution for managing inspection forms across multiple vehicle types, subtypes, and fuel types. The admin panel gives full control without requiring code changes, and the mobile app dynamically adapts to the configured templates.

**Next Steps:**

1. Implement database schema
2. Build admin panel UI
3. Create REST APIs
4. Integrate with mobile app
5. Test with real inspection scenarios

---

**Document Version**: 1.0  
**Last Updated**: 2026-05-11  
**Author**: Kiro AI Assistant
