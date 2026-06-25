import OwnerEditActions from "@/components/LetterManagement/OwnerEditActions"

interface DesktopEditPocketProps {
  editFormId: string
  onCancel: () => void
  isSaving: boolean
}

export default function DesktopEditPocket({
  editFormId,
  onCancel,
  isSaving
}: DesktopEditPocketProps) {
  return (
    <div
      data-testid="desktop-edit-pocket"
      className="owner-edit-pocket is-sticky is-visible"
      data-pocket-state="visible"
    >
      <OwnerEditActions 
        editFormId={editFormId} 
        onCancel={onCancel} 
        isSaving={isSaving}
      />
    </div>
  )
}