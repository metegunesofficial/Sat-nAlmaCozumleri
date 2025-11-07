import { describe, it, expect } from 'vitest';
import { validateWorkflow } from '@/lib/workflow-validator';
import type { WorkflowDefinition } from '@/types/workflow';

describe('Workflow Validation', () => {
  describe('Valid Workflows', () => {
    it('should validate a simple linear workflow', () => {
      const workflow: WorkflowDefinition = {
        nodes: [
          {
            id: 'start-1',
            type: 'start',
            position: { x: 0, y: 0 },
            data: { label: 'Start' },
          },
          {
            id: 'approval-1',
            type: 'approval',
            position: { x: 200, y: 0 },
            data: {
              label: 'Manager Approval',
              config: {
                approverType: 'role',
                approverRole: 'APPROVER',
                threshold: 'any',
                timeoutDays: 3,
              },
            },
          },
          {
            id: 'end-1',
            type: 'end',
            position: { x: 400, y: 0 },
            data: { label: 'End', status: 'APPROVED' },
          },
        ],
        edges: [
          { id: 'e1', source: 'start-1', target: 'approval-1' },
          { id: 'e2', source: 'approval-1', target: 'end-1' },
        ],
      };

      const result = validateWorkflow(workflow);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should validate a workflow with decision node', () => {
      const workflow: WorkflowDefinition = {
        nodes: [
          {
            id: 'start-1',
            type: 'start',
            position: { x: 0, y: 0 },
            data: { label: 'Start' },
          },
          {
            id: 'decision-1',
            type: 'decision',
            position: { x: 200, y: 0 },
            data: {
              label: 'Check Amount',
              config: {
                conditions: [
                  {
                    field: 'estimatedTotal',
                    operator: '>',
                    value: 10000,
                    label: 'High Amount',
                  },
                ],
              },
            },
          },
          {
            id: 'approval-1',
            type: 'approval',
            position: { x: 400, y: -100 },
            data: {
              label: 'Manager Approval',
              config: {
                approverType: 'role',
                approverRole: 'APPROVER',
                threshold: 'any',
                timeoutDays: 3,
              },
            },
          },
          {
            id: 'end-1',
            type: 'end',
            position: { x: 400, y: 100 },
            data: { label: 'Auto Approve', status: 'APPROVED' },
          },
          {
            id: 'end-2',
            type: 'end',
            position: { x: 600, y: -100 },
            data: { label: 'Approved', status: 'APPROVED' },
          },
        ],
        edges: [
          { id: 'e1', source: 'start-1', target: 'decision-1' },
          { id: 'e2', source: 'decision-1', target: 'approval-1', label: 'true' },
          { id: 'e3', source: 'decision-1', target: 'end-1', label: 'false' },
          { id: 'e4', source: 'approval-1', target: 'end-2' },
        ],
      };

      const result = validateWorkflow(workflow);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('Invalid Workflows - Structure', () => {
    it('should reject workflow with no start node', () => {
      const workflow: WorkflowDefinition = {
        nodes: [
          {
            id: 'approval-1',
            type: 'approval',
            position: { x: 0, y: 0 },
            data: {
              label: 'Approval',
              config: {
                approverType: 'role',
                approverRole: 'APPROVER',
                threshold: 'any',
                timeoutDays: 3,
              },
            },
          },
          {
            id: 'end-1',
            type: 'end',
            position: { x: 200, y: 0 },
            data: { label: 'End', status: 'APPROVED' },
          },
        ],
        edges: [{ id: 'e1', source: 'approval-1', target: 'end-1' }],
      };

      const result = validateWorkflow(workflow);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Workflow must have exactly one Start node');
    });

    it('should reject workflow with multiple start nodes', () => {
      const workflow: WorkflowDefinition = {
        nodes: [
          {
            id: 'start-1',
            type: 'start',
            position: { x: 0, y: 0 },
            data: { label: 'Start 1' },
          },
          {
            id: 'start-2',
            type: 'start',
            position: { x: 0, y: 100 },
            data: { label: 'Start 2' },
          },
          {
            id: 'end-1',
            type: 'end',
            position: { x: 200, y: 0 },
            data: { label: 'End', status: 'APPROVED' },
          },
        ],
        edges: [
          { id: 'e1', source: 'start-1', target: 'end-1' },
          { id: 'e2', source: 'start-2', target: 'end-1' },
        ],
      };

      const result = validateWorkflow(workflow);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Workflow must have exactly one Start node');
    });

    it('should reject workflow with no end node', () => {
      const workflow: WorkflowDefinition = {
        nodes: [
          {
            id: 'start-1',
            type: 'start',
            position: { x: 0, y: 0 },
            data: { label: 'Start' },
          },
          {
            id: 'approval-1',
            type: 'approval',
            position: { x: 200, y: 0 },
            data: {
              label: 'Approval',
              config: {
                approverType: 'role',
                approverRole: 'APPROVER',
                threshold: 'any',
                timeoutDays: 3,
              },
            },
          },
        ],
        edges: [{ id: 'e1', source: 'start-1', target: 'approval-1' }],
      };

      const result = validateWorkflow(workflow);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Workflow must have at least one End node');
    });

    it('should reject workflow with orphan nodes', () => {
      const workflow: WorkflowDefinition = {
        nodes: [
          {
            id: 'start-1',
            type: 'start',
            position: { x: 0, y: 0 },
            data: { label: 'Start' },
          },
          {
            id: 'approval-1',
            type: 'approval',
            position: { x: 200, y: 0 },
            data: {
              label: 'Approval',
              config: {
                approverType: 'role',
                approverRole: 'APPROVER',
                threshold: 'any',
                timeoutDays: 3,
              },
            },
          },
          {
            id: 'orphan-1',
            type: 'approval',
            position: { x: 200, y: 200 },
            data: {
              label: 'Orphan',
              config: {
                approverType: 'role',
                approverRole: 'APPROVER',
                threshold: 'any',
                timeoutDays: 3,
              },
            },
          },
          {
            id: 'end-1',
            type: 'end',
            position: { x: 400, y: 0 },
            data: { label: 'End', status: 'APPROVED' },
          },
        ],
        edges: [
          { id: 'e1', source: 'start-1', target: 'approval-1' },
          { id: 'e2', source: 'approval-1', target: 'end-1' },
        ],
      };

      const result = validateWorkflow(workflow);

      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.includes('orphan'))).toBe(true);
    });

    it('should reject workflow with cycles', () => {
      const workflow: WorkflowDefinition = {
        nodes: [
          {
            id: 'start-1',
            type: 'start',
            position: { x: 0, y: 0 },
            data: { label: 'Start' },
          },
          {
            id: 'approval-1',
            type: 'approval',
            position: { x: 200, y: 0 },
            data: {
              label: 'Approval 1',
              config: {
                approverType: 'role',
                approverRole: 'APPROVER',
                threshold: 'any',
                timeoutDays: 3,
              },
            },
          },
          {
            id: 'approval-2',
            type: 'approval',
            position: { x: 400, y: 0 },
            data: {
              label: 'Approval 2',
              config: {
                approverType: 'role',
                approverRole: 'APPROVER',
                threshold: 'any',
                timeoutDays: 3,
              },
            },
          },
          {
            id: 'end-1',
            type: 'end',
            position: { x: 600, y: 0 },
            data: { label: 'End', status: 'APPROVED' },
          },
        ],
        edges: [
          { id: 'e1', source: 'start-1', target: 'approval-1' },
          { id: 'e2', source: 'approval-1', target: 'approval-2' },
          { id: 'e3', source: 'approval-2', target: 'approval-1' }, // Cycle!
          { id: 'e4', source: 'approval-2', target: 'end-1' },
        ],
      };

      const result = validateWorkflow(workflow);

      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.includes('cycle') || e.includes('Cycle'))).toBe(true);
    });
  });

  describe('Invalid Workflows - Configuration', () => {
    it('should reject decision node with less than 2 outgoing edges', () => {
      const workflow: WorkflowDefinition = {
        nodes: [
          {
            id: 'start-1',
            type: 'start',
            position: { x: 0, y: 0 },
            data: { label: 'Start' },
          },
          {
            id: 'decision-1',
            type: 'decision',
            position: { x: 200, y: 0 },
            data: {
              label: 'Decision',
              config: {
                conditions: [
                  {
                    field: 'estimatedTotal',
                    operator: '>',
                    value: 10000,
                    label: 'High',
                  },
                ],
              },
            },
          },
          {
            id: 'end-1',
            type: 'end',
            position: { x: 400, y: 0 },
            data: { label: 'End', status: 'APPROVED' },
          },
        ],
        edges: [
          { id: 'e1', source: 'start-1', target: 'decision-1' },
          { id: 'e2', source: 'decision-1', target: 'end-1' },
          // Decision should have at least 2 outgoing edges
        ],
      };

      const result = validateWorkflow(workflow);

      expect(result.isValid).toBe(false);
      expect(
        result.errors.some((e) => e.includes('Decision') && e.includes('2'))
      ).toBe(true);
    });

    it('should reject approval node without configuration', () => {
      const workflow: WorkflowDefinition = {
        nodes: [
          {
            id: 'start-1',
            type: 'start',
            position: { x: 0, y: 0 },
            data: { label: 'Start' },
          },
          {
            id: 'approval-1',
            type: 'approval',
            position: { x: 200, y: 0 },
            data: {
              label: 'Approval',
              // Missing config!
            },
          },
          {
            id: 'end-1',
            type: 'end',
            position: { x: 400, y: 0 },
            data: { label: 'End', status: 'APPROVED' },
          },
        ],
        edges: [
          { id: 'e1', source: 'start-1', target: 'approval-1' },
          { id: 'e2', source: 'approval-1', target: 'end-1' },
        ],
      };

      const result = validateWorkflow(workflow);

      expect(result.isValid).toBe(false);
      expect(
        result.errors.some((e) => e.includes('Approval') && e.includes('config'))
      ).toBe(true);
    });
  });

  describe('Warnings', () => {
    it('should warn about high complexity workflows', () => {
      // Create a workflow with many nodes
      const nodes = [
        {
          id: 'start-1',
          type: 'start' as const,
          position: { x: 0, y: 0 },
          data: { label: 'Start' },
        },
      ];

      // Add 15 approval nodes
      for (let i = 1; i <= 15; i++) {
        nodes.push({
          id: `approval-${i}`,
          type: 'approval' as const,
          position: { x: i * 100, y: 0 },
          data: {
            label: `Approval ${i}`,
            config: {
              approverType: 'role' as const,
              approverRole: 'APPROVER' as const,
              threshold: 'any' as const,
              timeoutDays: 3,
            },
          },
        });
      }

      nodes.push({
        id: 'end-1',
        type: 'end' as const,
        position: { x: 1600, y: 0 },
        data: { label: 'End', status: 'APPROVED' as const },
      });

      const edges = [
        { id: 'e0', source: 'start-1', target: 'approval-1' },
      ];

      for (let i = 1; i < 15; i++) {
        edges.push({
          id: `e${i}`,
          source: `approval-${i}`,
          target: `approval-${i + 1}`,
        });
      }

      edges.push({
        id: 'e15',
        source: 'approval-15',
        target: 'end-1',
      });

      const workflow: WorkflowDefinition = { nodes, edges };
      const result = validateWorkflow(workflow);

      expect(result.warnings.length).toBeGreaterThan(0);
      expect(
        result.warnings.some((w) => w.includes('complex') || w.includes('many'))
      ).toBe(true);
    });
  });
});
