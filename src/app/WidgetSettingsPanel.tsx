import { Trash2 } from 'lucide-react'
import { SettingField } from '@/components/SettingField'
import { Sheet } from '@/components/Sheet'
import { useDashboard } from '@/store/dashboardStore'
import { getDefaultSettings, getWidget } from '@/widget-sdk/registry'

/** Generic settings drawer, rendered from the widget manifest's settings schema. */
export function WidgetSettingsPanel({ instanceId, onClose }: { instanceId: string | null; onClose: () => void }) {
  const instance = useDashboard((s) => s.widgets.find((w) => w.id === instanceId))
  const updateWidgetSettings = useDashboard((s) => s.updateWidgetSettings)
  const removeWidget = useDashboard((s) => s.removeWidget)
  const definition = instance && getWidget(instance.type)
  const settings = { ...getDefaultSettings(definition), ...instance?.settings }

  return (
    <Sheet
      open={Boolean(instance && definition)}
      onClose={onClose}
      title={definition?.name ?? 'Widget'}
      description={definition?.description}
    >
      {instance && (
        <>
          <div className="space-y-5">
            {definition?.settings?.map((setting) => (
              <SettingField
                key={setting.key}
                setting={setting}
                value={settings[setting.key]}
                onChange={(value) => updateWidgetSettings(instance.id, { [setting.key]: value })}
              />
            ))}
          </div>
          <button
            onClick={() => {
              onClose()
              removeWidget(instance.id)
            }}
            className="mt-8 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-red-400/20 py-2.5 text-sm text-red-300 transition hover:bg-red-500/10"
          >
            <Trash2 className="size-4" /> Remove widget
          </button>
        </>
      )}
    </Sheet>
  )
}
