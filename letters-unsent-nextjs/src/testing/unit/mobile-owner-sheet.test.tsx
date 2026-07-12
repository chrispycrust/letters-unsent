import { fireEvent, render, screen } from "@testing-library/react"
import MobileOwnerSheet, {
  type MobileOwnerSheetMode,
  type MobileOwnerSheetSnap,
} from "@/components/LetterManagement/MobileOwnerSheet"

class MockPointerEvent extends MouseEvent {
  readonly pointerId: number

  constructor(type: string, init: PointerEventInit = {}) {
    super(type, init)
    this.pointerId = init.pointerId ?? 1
  }
}

const originalPointerEvent = window.PointerEvent

function renderSheet({
  snap = "compact",
  mode = "open-verified-actions",
  children = <button type="button">Owner control</button>,
  onSnapChange = jest.fn(),
}: {
  snap?: MobileOwnerSheetSnap
  mode?: MobileOwnerSheetMode
  children?: React.ReactNode
  onSnapChange?: jest.Mock
} = {}) {
  const view = render(
    <MobileOwnerSheet mode={mode} snap={snap} onSnapChange={onSnapChange}>
      {children}
    </MobileOwnerSheet>,
  )

  return {
    ...view,
    onSnapChange,
    rerenderSheet(nextSnap: MobileOwnerSheetSnap, nextMode = mode, nextChildren = children) {
      view.rerender(
        <MobileOwnerSheet mode={nextMode} snap={nextSnap} onSnapChange={onSnapChange}>
          {nextChildren}
        </MobileOwnerSheet>,
      )
    },
  }
}

describe("MobileOwnerSheet", () => {
  beforeAll(() => {
    Object.defineProperty(window, "PointerEvent", {
      configurable: true,
      writable: true,
      value: MockPointerEvent,
    })
  })

  afterAll(() => {
    Object.defineProperty(window, "PointerEvent", {
      configurable: true,
      writable: true,
      value: originalPointerEvent,
    })
  })

  it("settles each pointer tap once even when the browser follows it with a click", () => {
    const { onSnapChange, rerenderSheet } = renderSheet()
    let handle = screen.getByRole("button", { name: "Expand owner controls" })

    fireEvent.pointerDown(handle, { button: 0, clientY: 100, pointerId: 1 })
    fireEvent.pointerUp(handle, { button: 0, clientY: 100, pointerId: 1 })
    fireEvent.click(handle, { detail: 1 })

    expect(onSnapChange).toHaveBeenCalledTimes(1)
    expect(onSnapChange).toHaveBeenLastCalledWith("full")

    rerenderSheet("full")
    handle = screen.getByRole("button", { name: "Minimise owner controls" })
    fireEvent.pointerDown(handle, { button: 0, clientY: 100, pointerId: 2 })
    fireEvent.pointerUp(handle, { button: 0, clientY: 100, pointerId: 2 })
    fireEvent.click(handle, { detail: 1 })

    expect(onSnapChange).toHaveBeenCalledTimes(2)
    expect(onSnapChange).toHaveBeenLastCalledWith("compact")
  })

  it("allows keyboard and assistive clicks to toggle the handle", () => {
    const { onSnapChange } = renderSheet()

    fireEvent.click(screen.getByRole("button", { name: "Expand owner controls" }), { detail: 0 })

    expect(onSnapChange).toHaveBeenCalledWith("full")
  })

  it("settles upward and downward drags started on the sheet background", () => {
    const { onSnapChange, rerenderSheet } = renderSheet()
    const sheet = screen.getByRole("dialog", { name: "Owner actions" })

    fireEvent.pointerDown(sheet, { button: 0, clientY: 240, pointerId: 3 })
    fireEvent.pointerMove(sheet, { clientY: 120, pointerId: 3 })
    fireEvent.pointerUp(sheet, { clientY: 120, pointerId: 3 })
    expect(onSnapChange).toHaveBeenLastCalledWith("full")

    rerenderSheet("full")
    fireEvent.pointerDown(sheet, { button: 0, clientY: 120, pointerId: 4 })
    fireEvent.pointerMove(sheet, { clientY: 240, pointerId: 4 })
    fireEvent.pointerUp(sheet, { clientY: 240, pointerId: 4 })
    expect(onSnapChange).toHaveBeenLastCalledWith("compact")
  })

  it("returns to the settled snap when a pointer gesture is cancelled", () => {
    const { onSnapChange } = renderSheet({ snap: "full" })
    const sheet = screen.getByRole("dialog", { name: "Owner actions" })
    const overlay = screen.getByTestId("mobile-owner-sheet-overlay")

    fireEvent.pointerDown(sheet, { button: 0, clientY: 120, pointerId: 5 })
    fireEvent.pointerMove(sheet, { clientY: 220, pointerId: 5 })
    expect(overlay.className).toContain("is-dragging")

    fireEvent.pointerCancel(sheet, { clientY: 220, pointerId: 5 })

    expect(onSnapChange).toHaveBeenCalledTimes(0)
    expect(overlay.className).not.toContain("is-dragging")
    expect(sheet.style.getPropertyValue("--owner-sheet-drag-offset")).toBe("0px")
  })

  it("does not drag from owner controls and leaves their clicks working", () => {
    const onOwnerControl = jest.fn()
    const { onSnapChange } = renderSheet({
      snap: "full",
      children: <button onClick={onOwnerControl}>Edit</button>,
    })
    const control = screen.getByRole("button", { name: "Edit" })

    fireEvent.pointerDown(control, { button: 0, clientY: 120, pointerId: 6 })
    fireEvent.pointerMove(control, { clientY: 240, pointerId: 6 })
    fireEvent.pointerUp(control, { clientY: 240, pointerId: 6 })
    fireEvent.click(control)

    expect(onSnapChange).toHaveBeenCalledTimes(0)
    expect(onOwnerControl).toHaveBeenCalledTimes(1)
  })

  it("preserves its controlled snap across content changes and hides compact controls", () => {
    const input = <input aria-label="Owner token" />
    const { rerenderSheet } = renderSheet({ snap: "full", children: input })
    const sheet = screen.getByRole("dialog", { name: "Owner actions" })
    const tokenInput = screen.getByRole("textbox", { name: "Owner token" })
    tokenInput.focus()

    rerenderSheet("full", "editing", <button type="button">Save changes</button>)
    expect(sheet.getAttribute("data-sheet-mode")).toBe("editing")
    expect(sheet.getAttribute("data-sheet-snap")).toBe("full")

    rerenderSheet("compact", "editing", input)
    const content = document.querySelector(".owner-bottom-sheet-content") as HTMLElement
    const handle = screen.getByRole("button", { name: "Expand owner controls" })

    expect(content.getAttribute("aria-hidden")).toBe("true")
    expect(content.hasAttribute("inert")).toBe(true)
    expect(handle.getAttribute("aria-expanded")).toBe("false")
  })

  it("returns focus to the handle when focused controls are minimised", () => {
    const controls = <button type="button">Minimise controls</button>
    const { rerenderSheet } = renderSheet({ snap: "full", children: controls })
    const control = screen.getByRole("button", { name: "Minimise controls" })
    control.focus()

    rerenderSheet("compact", "open-verified-actions", controls)

    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Expand owner controls" }))
  })
})
