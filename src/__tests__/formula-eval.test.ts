import { describe, it, expect } from 'vitest';
import { formulaEvaluator, evaluateFormula, validateFormula } from '../lib/formula-eval';
import { Feature } from '../lib/schemas';

describe('Formula Evaluator', () => {
  const sampleFeature: Feature = {
    id: 'test-feature',
    zone: 'R1',
    height: 20,
    floors: 3,
    material: 'steel',
    roofType: 'flat'
  };

  describe('evaluateFormula', () => {
    it('should evaluate simple comparisons', () => {
      expect(evaluateFormula('toNumber(feature["height"]) > 15', sampleFeature)).toBe(true);
      expect(evaluateFormula('toNumber(feature["height"]) < 15', sampleFeature)).toBe(false);
    });

    it('should evaluate string operations', () => {
      expect(evaluateFormula('includes(lower(feature["material"]), "steel")', sampleFeature)).toBe(true);
      expect(evaluateFormula('includes(lower(feature["material"]), "wood")', sampleFeature)).toBe(false);
    });

    it('should evaluate array membership', () => {
      expect(evaluateFormula('in(feature["zone"], ["R1", "R2"])', sampleFeature)).toBe(true);
      expect(evaluateFormula('in(feature["zone"], ["C1", "C2"])', sampleFeature)).toBe(false);
    });

    it('should evaluate combined conditions', () => {
      expect(evaluateFormula('toNumber(feature["height"]) > 15 && in(feature["zone"], ["R1", "R2"])', sampleFeature)).toBe(true);
      expect(evaluateFormula('toNumber(feature["height"]) > 25 && in(feature["zone"], ["R1", "R2"])', sampleFeature)).toBe(false);
    });

    it('should handle empty values', () => {
      expect(evaluateFormula('isEmpty(feature["nonExistent"])', sampleFeature)).toBe(true);
      expect(evaluateFormula('isNotEmpty(feature["zone"])', sampleFeature)).toBe(true);
    });

    it('should handle helper functions', () => {
      expect(evaluateFormula('upper(feature["zone"]) === "R1"', sampleFeature)).toBe(true);
      expect(evaluateFormula('trim("  steel  ") === "steel"', sampleFeature)).toBe(true);
    });
  });

  describe('validateFormula', () => {
    it('should validate correct formulas', () => {
      const result = validateFormula('toNumber(feature["height"]) > 20');
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should reject dangerous patterns', () => {
      const dangerousPatterns = [
        'eval("alert(1)")',
        'new Function("return alert(1)")()',
        'window.location = "http://evil.com"',
        'document.cookie = "evil=1"',
        'localStorage.setItem("evil", "1")',
        'fetch("http://evil.com")',
        'XMLHttpRequest',
        'import("evil")',
        'require("evil")'
      ];

      dangerousPatterns.forEach(pattern => {
        const result = validateFormula(pattern);
        expect(result.valid).toBe(false);
        expect(result.error).toContain('dangerous');
      });
    });

    it('should reject syntax errors', () => {
      const syntaxErrors = [
        'toNumber(feature["height"] > 20', // Missing closing parenthesis
        'feature["height"] > > 20', // Double operator
        'toNumber(feature["height"]) &&', // Trailing operator
        'feature["height"] ++', // Invalid increment
      ];

      syntaxErrors.forEach(formula => {
        const result = validateFormula(formula);
        expect(result.valid).toBe(false);
        expect(result.error).toBeDefined();
      });
    });

    it('should accept safe formulas with proper syntax', () => {
      const safeFormulas = [
        'toNumber(feature["height"]) > 20',
        'includes(lower(feature["material"]), "steel")',
        'in(feature["zone"], ["R1", "R2"])',
        'isEmpty(feature["nonExistent"])',
        'toNumber(feature["height"]) > 20 && in(feature["zone"], ["R1", "R2"])'
      ];

      safeFormulas.forEach(formula => {
        const result = validateFormula(formula);
        expect(result.valid).toBe(true);
      });
    });
  });

  describe('formulaEvaluator helpers', () => {
    it('should provide correct helper functions', () => {
      const helpers = formulaEvaluator['helpers'];
      
      expect(helpers.lower('HELLO')).toBe('hello');
      expect(helpers.upper('hello')).toBe('HELLO');
      expect(helpers.trim('  hello  ')).toBe('hello');
      expect(helpers.toNumber('42')).toBe(42);
      expect(helpers.toNumber('invalid')).toBe(0);
      expect(helpers.includes('hello world', 'world')).toBe(true);
      expect(helpers.in('apple', ['apple', 'banana'])).toBe(true);
      expect(helpers.isEmpty('')).toBe(true);
      expect(helpers.isEmpty(null)).toBe(true);
      expect(helpers.isEmpty('hello')).toBe(false);
    });

    it('should provide examples', () => {
      const examples = formulaEvaluator.getExamples();
      expect(examples.length).toBeGreaterThan(0);
      expect(examples[0]).toHaveProperty('title');
      expect(examples[0]).toHaveProperty('formula');
      expect(examples[0]).toHaveProperty('description');
    });
  });

  describe('edge cases', () => {
    it('should handle missing feature fields gracefully', () => {
      expect(evaluateFormula('isEmpty(feature["nonExistent"])', sampleFeature)).toBe(true);
      expect(evaluateFormula('toNumber(feature["nonExistent"]) > 0', sampleFeature)).toBe(false);
    });

    it('should handle null and undefined values', () => {
      const featureWithNulls: Feature = {
        id: 'test',
        zone: null,
        height: null
      };
      
      expect(evaluateFormula('isEmpty(feature["zone"])', featureWithNulls)).toBe(true);
      expect(evaluateFormula('toNumber(feature["height"]) > 0', featureWithNulls)).toBe(false);
    });

    it('should handle complex nested expressions', () => {
      const complexFormula = 'toNumber(feature["height"]) > 15 && (includes(lower(feature["material"]), "steel") || in(feature["zone"], ["R1", "R2"]))';
      expect(evaluateFormula(complexFormula, sampleFeature)).toBe(true);
    });
  });
});
