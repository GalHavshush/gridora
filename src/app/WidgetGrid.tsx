import { useMemo } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import ReactGridLayout, { useContainerWidth, verticalCompactor, type Layout, type LayoutItem } from 'react-grid-layout'
import { WidgetContainer } from '@/components/WidgetContainer'
import { getWidget } from '@/widget-sdk/registry'
import { useDashboard, type WidgetInstance } from '@/store/dashboardStore'
import { GRID_COLS } from '@/store/layout'

/** Below this width widgets stack in one column and the saved 12-column layout is left untouched. */
const STACK_BELOW = 640

function toLayoutItem({ id, type, position }: WidgetInstance): LayoutItem {
  const { minSize, maxSize } = getWidget(type) ?? {}
  return { i: id, ...position, minW: minSize?.w, minH: minSize?.h, maxW: maxSize?.w, maxH: maxSize?.h }
}

function stackedLayout(widgets: WidgetInstance[]): Layout {
  let y = 0
  return [...widgets]
    .sort((a, b) => a.position.y - b.position.y || a.position.x - b.position.x)
    .map(({ id, position }) => {
      const item = { i: id, x: 0, y, w: 1, h: position.h }
      y += position.h
      return item
    })
}

export function WidgetGrid({ onOpenSettings }: { onOpenSettings: (id: string) => void }) {
  const widgets = useDashboard((s) => s.widgets)
  const isEditing = useDashboard((s) => s.isEditing)
  const updateLayout = useDashboard((s) => s.updateLayout)
  const { width, containerRef, mounted } = useContainerWidth()

  const stacked = width < STACK_BELOW
  const cols = stacked ? 1 : GRID_COLS
  const margin = width >= 1024 ? 20 : 14
  const colWidth = (width - margin * (cols + 1)) / cols
  // Cells stay roughly square-ish so a layout keeps its proportions across screen sizes.
  const rowHeight = stacked ? 76 : Math.min(104, Math.max(56, Math.round(colWidth * 0.72)))
  const canArrange = isEditing && !stacked

  const layout = useMemo(() => (stacked ? stackedLayout(widgets) : widgets.map(toLayoutItem)), [widgets, stacked])

  return (
    <div ref={containerRef} className="relative min-h-[calc(100dvh-68px)]">
      <AnimatePresence>
        {canArrange && mounted && <GridGuides colWidth={colWidth} rowHeight={rowHeight} margin={margin} />}
      </AnimatePresence>
      {mounted && (
        <ReactGridLayout
          width={width}
          layout={layout}
          gridConfig={{ cols, rowHeight, margin: [margin, margin], containerPadding: [margin, margin] }}
          dragConfig={{ enabled: canArrange, cancel: '.no-drag' }}
          resizeConfig={{ enabled: canArrange, handles: ['se'] }}
          compactor={verticalCompactor}
          onLayoutChange={stacked ? undefined : updateLayout}
        >
          {widgets.map((widget) => (
            <div key={widget.id} id={`widget-${widget.id}`}>
              <WidgetContainer instance={widget} isEditing={isEditing} onOpenSettings={onOpenSettings} />
            </div>
          ))}
        </ReactGridLayout>
      )}
    </div>
  )
}

/** The faint cell grid shown in edit mode, so it's obvious where widgets will snap. */
function GridGuides({ colWidth, rowHeight, margin }: { colWidth: number; rowHeight: number; margin: number }) {
  return (
    <motion.svg
      className="pointer-events-none absolute inset-0 h-full w-full text-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      aria-hidden="true"
    >
      <defs>
        <pattern
          id="gridora-cells"
          x={margin}
          y={margin}
          width={colWidth + margin}
          height={rowHeight + margin}
          patternUnits="userSpaceOnUse"
        >
          <rect
            width={colWidth}
            height={rowHeight}
            rx={14}
            fill="currentColor"
            fillOpacity={0.05}
            stroke="currentColor"
            strokeOpacity={0.14}
            strokeDasharray="4 5"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#gridora-cells)" />
    </motion.svg>
  )
}
