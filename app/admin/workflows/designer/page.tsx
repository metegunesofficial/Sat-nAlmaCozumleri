'use client';

/**
 * Visual Workflow Designer Page
 * Drag-and-drop workflow creation with ReactFlow
 */

import { useState, useCallback, useRef } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  Panel,
} from 'reactflow';
import 'reactflow/dist/style.css';

import { nodeTypes } from '@/components/workflow/nodes';
import {
  WorkflowDefinition,
  WorkflowNode,
  WorkflowEdge,
  ValidationResult,
} from '@/lib/workflow-types';
import { validateWorkflow } from '@/lib/workflow-validator';
import {
  Save,
  Play,
  CheckCircle,
  Download,
  Upload,
  AlertCircle,
  Plus,
  Trash2,
} from 'lucide-react';

export default function WorkflowDesignerPage() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [workflowName, setWorkflowName] = useState('Yeni Workflow');
  const [workflowDescription, setWorkflowDescription] = useState('');
  const [selectedNode, setSelectedNode] = useState<WorkflowNode | null>(null);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);

  // Handle node connection
  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  // Handle node selection
  const onNodeClick = useCallback((_event: any, node: Node) => {
    setSelectedNode(node as WorkflowNode);
  }, []);

  // Add new node to canvas
  const addNode = (type: WorkflowNode['type']) => {
    const newNode: WorkflowNode = {
      id: `${type}-${Date.now()}`,
      type,
      position: { x: 250, y: 250 },
      data: {
        label: getDefaultLabel(type),
        config: {},
      },
    };
    setNodes((nds) => [...nds, newNode]);
  };

  const getDefaultLabel = (type: WorkflowNode['type']): string => {
    const labels: Record<WorkflowNode['type'], string> = {
      start: 'Başlangıç',
      end: 'Bitiş',
      approval: 'Onay Al',
      decision: 'Karar Ver',
      notification: 'Bildirim Gönder',
      wait: 'Bekle',
      parallelSplit: 'Paralel Başlat',
      parallelJoin: 'Paralel Birleştir',
    };
    return labels[type];
  };

  // Validate current workflow
  const handleValidate = () => {
    const definition: WorkflowDefinition = {
      version: '1.0',
      nodes: nodes as WorkflowNode[],
      edges: edges as WorkflowEdge[],
      metadata: {
        name: workflowName,
        description: workflowDescription,
        createdAt: new Date().toISOString(),
        createdBy: 'current-user', // TODO: Get from auth
      },
    };

    const result = validateWorkflow(definition);
    setValidationResult(result);
  };

  // Save workflow
  const handleSave = async () => {
    // First validate
    handleValidate();

    const definition: WorkflowDefinition = {
      version: '1.0',
      nodes: nodes as WorkflowNode[],
      edges: edges as WorkflowEdge[],
      metadata: {
        name: workflowName,
        description: workflowDescription,
        createdAt: new Date().toISOString(),
        createdBy: 'current-user',
      },
    };

    const result = validateWorkflow(definition);
    if (!result.valid) {
      alert('Workflow geçersiz! Lütfen hataları düzeltin.');
      return;
    }

    setIsSaving(true);
    try {
      // TODO: Implement API call to save workflow
      console.log('Saving workflow:', definition);
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call
      alert('Workflow başarıyla kaydedildi!');
    } catch (error) {
      console.error('Failed to save workflow:', error);
      alert('Workflow kaydedilemedi!');
    } finally {
      setIsSaving(false);
    }
  };

  // Export workflow as JSON
  const handleExport = () => {
    const definition: WorkflowDefinition = {
      version: '1.0',
      nodes: nodes as WorkflowNode[],
      edges: edges as WorkflowEdge[],
      metadata: {
        name: workflowName,
        description: workflowDescription,
        createdAt: new Date().toISOString(),
        createdBy: 'current-user',
      },
    };

    const blob = new Blob([JSON.stringify(definition, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${workflowName.replace(/\s+/g, '-')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Clear canvas
  const handleClear = () => {
    if (confirm('Tüm workflow temizlensin mi?')) {
      setNodes([]);
      setEdges([]);
      setValidationResult(null);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex-1 max-w-md">
            <input
              type="text"
              value={workflowName}
              onChange={(e) => setWorkflowName(e.target.value)}
              className="text-2xl font-bold border-none focus:ring-0 focus:outline-none w-full"
              placeholder="Workflow Adı"
            />
            <input
              type="text"
              value={workflowDescription}
              onChange={(e) => setWorkflowDescription(e.target.value)}
              className="text-sm text-gray-600 border-none focus:ring-0 focus:outline-none w-full mt-1"
              placeholder="Açıklama ekleyin..."
            />
          </div>

          {/* Toolbar */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleValidate}
              className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 flex items-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              Doğrula
            </button>
            <button
              onClick={handleExport}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Dışa Aktar
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Kaydediliyor...' : 'Kaydet'}
            </button>
            <button
              onClick={handleClear}
              className="px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Validation Results */}
        {validationResult && (
          <div className="mt-4">
            {validationResult.valid ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-green-900">
                    Workflow geçerli!
                  </div>
                  {validationResult.warnings.length > 0 && (
                    <div className="text-sm text-green-700 mt-1">
                      {validationResult.warnings.length} uyarı var
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="font-semibold text-red-900">
                    {validationResult.errors.length} hata bulundu
                  </div>
                  <ul className="text-sm text-red-700 mt-2 space-y-1">
                    {validationResult.errors.map((error, idx) => (
                      <li key={idx}>• {error.message}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Node Palette - Left Sidebar */}
        <div className="w-64 bg-white border-r border-gray-200 p-4 overflow-y-auto">
          <h3 className="font-semibold text-gray-900 mb-4">Node Paletleri</h3>
          <div className="space-y-2">
            <NodePaletteItem
              icon="▶️"
              label="Başlangıç"
              color="green"
              onClick={() => addNode('start')}
            />
            <NodePaletteItem
              icon="✓"
              label="Onay"
              color="indigo"
              onClick={() => addNode('approval')}
            />
            <NodePaletteItem
              icon="◇"
              label="Karar"
              color="blue"
              onClick={() => addNode('decision')}
            />
            <NodePaletteItem
              icon="🔔"
              label="Bildirim"
              color="purple"
              onClick={() => addNode('notification')}
            />
            <NodePaletteItem
              icon="⏱️"
              label="Bekle"
              color="yellow"
              onClick={() => addNode('wait')}
            />
            <NodePaletteItem
              icon="⚡"
              label="Paralel Başlat"
              color="cyan"
              onClick={() => addNode('parallelSplit')}
            />
            <NodePaletteItem
              icon="⚡"
              label="Paralel Birleştir"
              color="teal"
              onClick={() => addNode('parallelJoin')}
            />
            <NodePaletteItem
              icon="⏹️"
              label="Bitiş"
              color="red"
              onClick={() => addNode('end')}
            />
          </div>

          {/* Quick Stats */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">
              İstatistikler
            </h4>
            <div className="space-y-1 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Node sayısı:</span>
                <span className="font-medium">{nodes.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Bağlantı sayısı:</span>
                <span className="font-medium">{edges.length}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ReactFlow Canvas */}
        <div className="flex-1 relative" ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            nodeTypes={nodeTypes}
            fitView
            className="bg-gray-50"
          >
            <Background variant={BackgroundVariant.Dots} gap={16} size={1} />
            <Controls />
            <MiniMap
              nodeColor={(node) => {
                const colors: Record<string, string> = {
                  start: '#10b981',
                  end: '#ef4444',
                  approval: '#6366f1',
                  decision: '#3b82f6',
                  notification: '#a855f7',
                  wait: '#eab308',
                  parallelSplit: '#06b6d4',
                  parallelJoin: '#14b8a6',
                };
                return colors[node.type || 'default'] || '#9ca3af';
              }}
              className="!bg-white !border-gray-200"
            />
          </ReactFlow>
        </div>

        {/* Properties Panel - Right Sidebar */}
        {selectedNode && (
          <div className="w-80 bg-white border-l border-gray-200 p-4 overflow-y-auto">
            <h3 className="font-semibold text-gray-900 mb-4">Node Özellikleri</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Node Tipi
                </label>
                <div className="px-3 py-2 bg-gray-50 rounded-lg text-sm text-gray-600">
                  {selectedNode.type}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Etiket
                </label>
                <input
                  type="text"
                  value={selectedNode.data.label}
                  onChange={(e) => {
                    setNodes((nds) =>
                      nds.map((node) =>
                        node.id === selectedNode.id
                          ? {
                              ...node,
                              data: { ...node.data, label: e.target.value },
                            }
                          : node
                      )
                    );
                    setSelectedNode({
                      ...selectedNode,
                      data: { ...selectedNode.data, label: e.target.value },
                    });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Node ID
                </label>
                <div className="px-3 py-2 bg-gray-50 rounded-lg text-xs text-gray-500 font-mono">
                  {selectedNode.id}
                </div>
              </div>
              {/* TODO: Add type-specific configuration forms */}
              <div className="pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-500">
                  Node-specific yapılandırma yakında eklenecek...
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Node Palette Item Component
function NodePaletteItem({
  icon,
  label,
  color,
  onClick,
}: {
  icon: string;
  label: string;
  color: string;
  onClick: () => void;
}) {
  const colorClasses: Record<string, string> = {
    green: 'bg-green-50 hover:bg-green-100 text-green-700',
    indigo: 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700',
    blue: 'bg-blue-50 hover:bg-blue-100 text-blue-700',
    purple: 'bg-purple-50 hover:bg-purple-100 text-purple-700',
    yellow: 'bg-yellow-50 hover:bg-yellow-100 text-yellow-700',
    cyan: 'bg-cyan-50 hover:bg-cyan-100 text-cyan-700',
    teal: 'bg-teal-50 hover:bg-teal-100 text-teal-700',
    red: 'bg-red-50 hover:bg-red-100 text-red-700',
  };

  return (
    <button
      onClick={onClick}
      className={`w-full px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${colorClasses[color]}`}
    >
      <span className="text-xl">{icon}</span>
      <span className="font-medium text-sm">{label}</span>
    </button>
  );
}
