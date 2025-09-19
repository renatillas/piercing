import lustre/attribute
import lustre/element
import lustre/element/html
import lustre/event

pub type ModalState {
  Closed
  Open(current: Image, filtered_images: List(Image))
}

pub type Image {
  Image(src: String, alt: String)
}

pub fn modal_view(
  modal: ModalState,
  close_modal_event,
  go_to_previous_photo_event,
  go_to_next_photo_event,
) {
  case modal {
    Closed -> html.div([], [])
    Open(current, filtered_images) ->
      html.dialog(
        [
          attribute.class(
            "fixed inset-0 z-50 bg-black/80 backdrop-blur-sm m-0 max-w-none max-h-none w-full h-full flex items-center justify-center p-4",
          ),
          attribute.attribute("open", ""),
          event.on_click(close_modal_event),
        ],
        [
          html.div(
            [
              attribute.class(
                "relative max-w-5xl max-h-[90vh] bg-black border-2 border-transparent shadow-2xl shadow-black/80",
              ),
            ],
            [
              html.button(
                [
                  attribute.class(
                    "absolute top-2 right-2 text-white text-2xl font-bold z-10 w-8 h-8 flex items-center justify-center transition-all duration-300 hover:scale-130",
                  ),
                  attribute.attribute("aria-label", "Close modal"),
                  event.on_click(close_modal_event),
                ],
                [
                  element.text("×"),
                ],
              ),
              html.figure(
                [
                  attribute.class(
                    "bg-black border border-white/10 relative overflow-hidden m-0",
                  ),
                ],
                [
                  html.button(
                    [
                      attribute.class(
                        "absolute top-70 left-0 text-white text-2xl font-bold z-10 w-8 h-8 flex items-center justify-center  transition-all duration-300 hover:scale-130 ",
                      ),
                      attribute.attribute("aria-label", "Close modal"),
                      event.on_click(go_to_previous_photo_event(
                        current,
                        filtered_images,
                      ))
                        |> event.stop_propagation(),
                    ],
                    [html.text("<")],
                  ),
                  html.button(
                    [
                      attribute.class(
                        "absolute top-70 right-0 text-white text-2xl font-bold z-10 w-8 h-8 flex items-center justify-center  transition-all duration-300 hover:scale-130 ",
                      ),
                      attribute.attribute("aria-label", "Close modal"),
                      event.on_click(go_to_next_photo_event(
                        current,
                        filtered_images,
                      ))
                        |> event.stop_propagation(),
                    ],
                    [html.text(">")],
                  ),
                  html.img([
                    attribute.src(current.src),
                    attribute.alt(current.alt),
                    attribute.class("max-w-full max-h-[80vh] object-contain"),
                  ]),
                  html.figcaption(
                    [
                      attribute.class(
                        "modal-caption-accent bg-transparent border-t border-white/10 p-4 text-center text-gray-300 uppercase tracking-[2px] relative",
                      ),
                      attribute.style(
                        "font-family",
                        "'Dark Reborn', sans-serif",
                      ),
                      attribute.style(
                        "text-shadow",
                        "0 0 10px rgba(255,255,255,0.3), 2px 2px 4px rgba(0,0,0,0.8)",
                      ),
                    ],
                    [
                      element.text(current.alt),
                    ],
                  ),
                ],
              ),
            ],
          ),
        ],
      )
  }
}
