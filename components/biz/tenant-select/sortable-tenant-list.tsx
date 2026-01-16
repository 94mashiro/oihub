import { useCallback } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { cn } from '@/lib/utils';
import { FramePanel } from '@/components/ui/frame';
import TenantSelectCard from '../tenant-select-card';
import { useTenantStore } from '@/lib/state/tenant-store';
import { useSettingStore } from '@/lib/state/setting-store';
import { SortField } from '@/types/sort';
import type { Tenant, TenantId } from '@/types/tenant';

interface SortableTenantCardProps {
  tenant: Tenant;
  isSelected: boolean;
  isDragEnabled: boolean;
  onSelect: () => void;
}

function SortableTenantCard({
  tenant,
  isSelected,
  isDragEnabled,
  onSelect,
}: SortableTenantCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: tenant.id,
    disabled: !isDragEnabled,
  });

  const style = {
    // 只使用 translate，忽略 scale 避免拖拽时卡片被压缩
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
    // 拖拽时禁用 transition，避免延迟感
    transition: isDragging ? undefined : transition,
  };

  return (
    <FramePanel
      ref={setNodeRef}
      style={style}
      className={cn(
        'group/drag relative w-full select-none rounded-md p-2 hover:bg-zinc-50',
        isSelected && 'bg-zinc-100!',
        isDragging && 'opacity-50 shadow-lg z-50',
      )}
      onClick={onSelect}
    >
      <TenantSelectCard
        tenantId={tenant.id}
        isSelected={isSelected}
        isDragEnabled={isDragEnabled}
        dragHandleProps={{
          attributes,
          listeners,
          isDragging,
        }}
      />
    </FramePanel>
  );
}

interface SortableTenantListProps {
  tenants: Tenant[];
  selectedTenantId: TenantId | null;
  onSelectTenant: (id: TenantId) => void;
}

export function SortableTenantList({
  tenants,
  selectedTenantId,
  onSelectTenant,
}: SortableTenantListProps) {
  const sortConfig = useSettingStore((state) => state.tenantSortConfig);
  const tenantList = useTenantStore((state) => state.tenantList);
  const setTenantList = useTenantStore((state) => state.setTenantList);

  const isDragEnabled = sortConfig.field === SortField.MANUAL;

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const oldIndex = tenantList.findIndex((t) => t.id === active.id);
      const newIndex = tenantList.findIndex((t) => t.id === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        const newList = [...tenantList];
        const [removed] = newList.splice(oldIndex, 1);
        newList.splice(newIndex, 0, removed);
        setTenantList(newList);
      }
    },
    [tenantList, setTenantList],
  );

  const tenantIds = tenants.map((t) => t.id);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      modifiers={[restrictToVerticalAxis]}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={tenantIds} strategy={verticalListSortingStrategy}>
        {tenants.map((tenant) => (
          <SortableTenantCard
            key={tenant.id}
            tenant={tenant}
            isSelected={selectedTenantId === tenant.id}
            isDragEnabled={isDragEnabled}
            onSelect={() => onSelectTenant(tenant.id)}
          />
        ))}
      </SortableContext>
    </DndContext>
  );
}
