# UbemArchetypeRulesUI

A static web application for authoring, visualizing, and exporting/importing rules that map building features to archetypes. Features drag-and-drop rule ordering, rich condition builders, custom formula rules, and live Plotly Sankey visualization of assignment flows.

## Features

- **Rule Authoring**: Create and manage rules with drag-and-drop ordering
- **Condition Builder**: Rich interface for building complex conditions with multiple operators
- **Custom Formulas**: Safe expression evaluator for custom rule logic
- **Live Visualization**: Real-time Sankey diagram showing feature-to-archetype assignments
- **Import/Export**: JSON-based ruleset and feature data import/export
- **Grouping**: Configurable grouping for features and archetypes in visualizations
- **Local Storage**: Automatic persistence of rules and settings

## Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd UBEMArchetypeRulesUI

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Development

```bash
# Start development server
npm run dev

# Run tests
npm run test

# Lint code
npm run lint

# Format code
npm run format
```

## Usage

### Creating Rules

1. **Add a Rule**: Click "Add Rule" to create a new builder rule
2. **Add Custom Rule**: Click "Custom Rule" to create a formula-based rule
3. **Configure Conditions**: Use the condition builder to specify feature matching logic
4. **Set Priority**: Higher priority rules are evaluated first
5. **Assign Archetype**: Select which archetype to assign when conditions match

### Rule Types

#### Builder Rules
- Use a visual interface to build conditions
- Support multiple logic operators (all, any, none)
- Various comparison operators (equals, contains, greater than, etc.)

#### Custom Rules
- Write formulas using a safe expression evaluator
- Access feature data via `feature["fieldName"]`
- Use helper functions: `lower()`, `upper()`, `trim()`, `toNumber()`, `includes()`, `in()`, `isEmpty()`

Example custom formulas:
```javascript
// String contains check
includes(lower(feature["material"]), "steel")

// Numeric comparison
toNumber(feature["height"]) > 20

// Array membership
in(feature["zone"], ["R1", "R2"])

// Combined conditions
in(feature["zone"], ["R1", "R2"]) && toNumber(feature["height"]) > 20
```

### Visualization Settings

Configure how features and archetypes are grouped in the Sankey diagram:

- **Feature Grouping**: Group features by one or two categorical fields
- **Archetype Grouping**: Group archetypes by template prefix (e.g., RES, COM, IND)
- **Color Schemes**: Choose between Accent and Set1 color palettes

### Import/Export

#### Ruleset Format
```json
{
  "settings": {
    "featuresGroupLevel1": "zone",
    "featuresGroupLevel2": "type", 
    "colorMap": "Accent",
    "templateGrouped": true
  },
  "archetypeOptions": ["RES_A1_01.json", "RES_A1_02.json", "COM_B3_01.json"],
  "rules": [
    {
      "id": "r1",
      "type": "builder",
      "logic": "all",
      "priority": 99,
      "conditions": [
        {"field": "height", "operator": "gte", "value": 20},
        {"field": "zone", "operator": "in", "value": ["R1", "R2"]}
      ],
      "assignArchetype": "RES_A1_01.json"
    },
    {
      "id": "r2", 
      "type": "custom",
      "priority": 120,
      "formula": "in(feature['roofType'], ['flat','shed']) && toNumber(feature['floors']) >= 6",
      "assignArchetype": "COM_B3_01.json"
    }
  ]
}
```

#### Features Format
```json
[
  {
    "id": "feat_001",
    "zone": "R1",
    "type": "single_family", 
    "height": 8,
    "floors": 2,
    "material": "wood",
    "roofType": "gable"
  }
]
```

## Data Model

### Condition
- `field`: Feature field name (string)
- `operator`: Comparison operator (equals, contains, gt, in, etc.)
- `value`: Comparison value (string, number, boolean, array, null)

### Rule
- `id`: Unique identifier (UUID)
- `type`: "builder" or "custom"
- `logic`: "all", "any", or "none" (for builder rules)
- `conditions`: Array of Condition objects (for builder rules)
- `formula`: JavaScript expression string (for custom rules)
- `assignArchetype`: Target archetype filename
- `priority`: Rule priority (higher = evaluated first)

### Archetype Hierarchy
Archetype filenames follow the pattern `AAAA_BB_CC.json`:
- `AAAA`: Group prefix (e.g., RES, COM, IND)
- `BB_CC`: Specific archetype identifier

The UI supports hierarchical dropdowns grouped by prefix when `templateGrouped` is enabled.

## Rule Evaluation

Rules are evaluated in priority order (highest first), with array order as tie-breaker. The first matching rule assigns the archetype; subsequent rules are ignored for that feature.

### Type Coercion
The engine automatically handles type coercion:
- Strings that look like numbers → numbers
- "true"/"false" strings → booleans
- ISO date strings → timestamps
- Everything else → strings

### Operators
- **equals/notEquals**: Strict equality after type coercion
- **contains/notContains**: String substring or array membership
- **gt/gte/lt/lte**: Numeric or date comparison
- **in/notIn**: Array membership
- **isEmpty/isNotEmpty**: Null/undefined/empty string checks

## Architecture

### Tech Stack
- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: TailwindCSS
- **State**: Zustand
- **Validation**: Zod
- **Drag & Drop**: @dnd-kit
- **Charts**: Plotly.js
- **Forms**: React Select

### Project Structure
```
src/
├── components/          # React components
│   ├── RuleList.tsx    # Drag-and-drop rule list
│   ├── RuleCard.tsx    # Individual rule editor
│   ├── ConditionRow.tsx # Condition builder
│   ├── CustomRuleCard.tsx # Formula rule editor
│   ├── SankeyPanel.tsx # Visualization panel
│   ├── SettingsPanel.tsx # Configuration panel
│   └── Toolbar.tsx     # Import/export toolbar
├── lib/                # Core logic
│   ├── schemas.ts      # Zod data models
│   ├── rules-engine.ts # Rule evaluation logic
│   ├── formula-eval.ts # Safe expression evaluator
│   ├── sankey-build.ts # Plotly visualization
│   ├── archetype-hierarchy.ts # Archetype grouping
│   ├── sample-data.ts  # Demo data
│   ├── storage.ts      # LocalStorage utilities
│   └── store.ts        # Zustand state management
└── pages/
    └── App.tsx         # Main application
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Run linting and tests
6. Submit a pull request

## License

MIT License - see LICENSE file for details.

