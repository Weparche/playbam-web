import Button from '../../../components/ui/Button'
import PartnerSheet from './PartnerSheet'

type Props = {
  open: boolean
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Obriši',
  cancelLabel = 'Odustani',
  onConfirm,
  onCancel,
}: Props) {
  return (
    <PartnerSheet
      open={open}
      onClose={onCancel}
      title={title}
      placement="center"
      footer={
        <>
          <Button variant="ghost" type="button" className="partner-btnDanger" onClick={onConfirm}>
            {confirmLabel}
          </Button>
          <Button variant="ghost" type="button" onClick={onCancel}>
            {cancelLabel}
          </Button>
        </>
      }
    >
      <p className="partner-confirmText">{message}</p>
    </PartnerSheet>
  )
}
