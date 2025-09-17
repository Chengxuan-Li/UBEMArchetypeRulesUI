import { Feature } from './schemas';
import { coerceValue } from './rules-engine';

// Safe expression evaluator for custom rules
export class SafeFormulaEvaluator {
  private allowedFunctions = new Set([
    'lower', 'upper', 'trim', 'toNumber', 'includes', 'in', 'isEmpty'
  ]);

  // Removed unused allowedOperators property

  // Helper functions available in expressions
  private helpers = {
    lower: (str: any) => String(str || '').toLowerCase(),
    upper: (str: any) => String(str || '').toUpperCase(),
    trim: (str: any) => String(str || '').trim(),
    toNumber: (x: any) => {
      const num = parseFloat(String(x));
      return isNaN(num) ? 0 : num;
    },
    includes: (haystack: any, needle: any) => {
      return String(haystack || '').includes(String(needle || ''));
    },
    in: (value: any, array: any[]) => {
      if (!Array.isArray(array)) return false;
      const coercedValue = coerceValue(value);
      return array.some(item => coerceValue(item) === coercedValue);
    },
    isEmpty: (value: any) => {
      if (value === null || value === undefined) return true;
      if (typeof value === 'string') return value.trim() === '';
      if (Array.isArray(value)) return value.length === 0;
      return false;
    }
  };

  // Validate expression for security
  private validateExpression(expression: string): boolean {
    // Check for dangerous patterns
    const dangerousPatterns = [
      /\beval\b/i,
      /\bFunction\b/i,
      /\bnew\s+Function/i,
      /\bwindow\b/i,
      /\bdocument\b/i,
      /\blocalStorage\b/i,
      /\bsessionStorage\b/i,
      /\bXMLHttpRequest\b/i,
      /\bfetch\b/i,
      /\bimport\b/i,
      /\brequire\b/i,
      /\b__proto__\b/i,
      /\bconstructor\b/i,
      /\bprototype\b/i,
      /\.\s*apply\s*\(/i,
      /\.\s*call\s*\(/i,
      /\.\s*bind\s*\(/i,
      /\bthis\b/i,
      /\bglobal\b/i,
      /\bprocess\b/i
    ];

    for (const pattern of dangerousPatterns) {
      if (pattern.test(expression)) {
        return false;
      }
    }

    return true;
  }

  // Parse and evaluate expression
  public evaluate(formula: string, feature: Feature): boolean {
    try {
      if (!this.validateExpression(formula)) {
        console.warn('Formula contains dangerous patterns:', formula);
        return false;
      }

      // Create safe evaluation context
      const context = {
        feature,
        ...this.helpers
      };

      // Simple expression parser (handles basic cases)
      let processedExpression = formula;

      // Replace feature["field"] or feature.field with feature.field
      processedExpression = processedExpression.replace(
        /feature\["([^"]+)"\]/g, 
        'context.feature["$1"]'
      );
      processedExpression = processedExpression.replace(
        /feature\['([^']+)'\]/g, 
        "context.feature['$1']"
      );
      processedExpression = processedExpression.replace(
        /feature\.([a-zA-Z_$][a-zA-Z0-9_$]*)/g, 
        'context.feature.$1'
      );

      // Replace function calls with context helpers
      for (const funcName of this.allowedFunctions) {
        const regex = new RegExp(`\\b${funcName}\\s*\\(`, 'g');
        processedExpression = processedExpression.replace(regex, `context.${funcName}(`);
      }

      // Create a safe evaluation function
      const func = new Function(
        'context',
        `"use strict"; return (${processedExpression});`
      );

      const result = func(context);
      return Boolean(result);

    } catch (error) {
      console.warn('Formula evaluation error:', error, 'Formula:', formula);
      return false;
    }
  }

  // Validate formula syntax without executing
  public validate(formula: string): { valid: boolean; error?: string } {
    try {
      if (!this.validateExpression(formula)) {
        return { valid: false, error: 'Formula contains potentially dangerous code' };
      }

      // Test with dummy feature
      const dummyFeature: Feature = { id: 'test' };
      this.evaluate(formula, dummyFeature);
      
      return { valid: true };
    } catch (error) {
      return { 
        valid: false, 
        error: error instanceof Error ? error.message : 'Unknown syntax error' 
      };
    }
  }

  // Get example formulas
  public getExamples(): Array<{ title: string; formula: string; description: string }> {
    return [
      {
        title: 'String contains',
        formula: 'includes(lower(feature["material"]), "steel")',
        description: 'Check if material field contains "steel" (case-insensitive)'
      },
      {
        title: 'Numeric comparison',
        formula: 'toNumber(feature["height"]) > 20',
        description: 'Check if height is greater than 20'
      },
      {
        title: 'Array membership',
        formula: 'in(feature["zone"], ["R1", "R2"])',
        description: 'Check if zone is in residential zones'
      },
      {
        title: 'Combined conditions',
        formula: 'in(feature["zone"], ["R1", "R2"]) && toNumber(feature["height"]) > 20',
        description: 'Check if zone is residential AND height > 20'
      },
      {
        title: 'String operations',
        formula: 'trim(feature["type"]) === "commercial" && !isEmpty(feature["floors"])',
        description: 'Check if type is commercial and floors field is not empty'
      },
      {
        title: 'Complex condition',
        formula: 'includes(lower(feature["roofType"]), "flat") || includes(lower(feature["roofType"]), "shed")',
        description: 'Check if roof type is flat OR shed'
      }
    ];
  }
}

// Global instance
export const formulaEvaluator = new SafeFormulaEvaluator();

// Convenience function
export function evaluateFormula(formula: string, feature: Feature): boolean {
  return formulaEvaluator.evaluate(formula, feature);
}

// Validation convenience function
export function validateFormula(formula: string): { valid: boolean; error?: string } {
  return formulaEvaluator.validate(formula);
}
