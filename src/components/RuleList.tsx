import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useAppStore } from '../lib/store';
import { RuleCard } from './RuleCard';

export function RuleList() {
  const { 
    ruleset, 
    selectedRuleId, 
    selectRule, 
    moveRule,
    addRule 
  } = useAppStore();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const oldIndex = ruleset.rules.findIndex(rule => rule.id === active.id);
      const newIndex = ruleset.rules.findIndex(rule => rule.id === over.id);
      moveRule(oldIndex, newIndex);
    }
  };

  if (ruleset.rules.length === 0) {
    return (
      <div className="text-center py-12">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No rules</h3>
        <p className="mt-1 text-sm text-gray-500">Get started by creating your first rule.</p>
        <div className="mt-6">
          <button
            onClick={addRule}
            className="btn btn-primary"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Rule
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={ruleset.rules.map(rule => rule.id)}
          strategy={verticalListSortingStrategy}
        >
          {ruleset.rules.map((rule, index) => (
            <RuleCard
              key={rule.id}
              rule={rule}
              index={index}
              isSelected={selectedRuleId === rule.id}
              onSelect={() => selectRule(rule.id)}
            />
          ))}
        </SortableContext>
      </DndContext>
    </div>
  );
}
