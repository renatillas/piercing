import lustre/attribute
import lustre/element
import lustre/element/html
import lustre/event

pub fn service_card(
  title: String,
  description: String,
  badge: String,
  image_url: String,
  category: String,
  open_modal_event,
) {
  html.div(
    [
      attribute.class(
        "relative overflow-hidden border border-gray-700 hover:border-white transition-all duration-300 group",
      ),
      event.on_click(case category {
        "ear" -> open_modal_event(image_url, title)
        "facial" -> open_modal_event(image_url, title)
        "body" -> open_modal_event(image_url, title)
        _ -> open_modal_event(image_url, title)
      }),
    ],
    [
      html.div([attribute.class("relative h-64 sm:h-72 overflow-hidden")], [
        html.img([
          attribute.src(image_url),
          attribute.class(
            "w-full h-full object-cover group-hover:scale-110 transition-transform duration-300",
          ),
          attribute.alt(title),
        ]),
        html.div(
          [
            attribute.class(
              "absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent",
            ),
          ],
          [],
        ),
        html.div(
          [
            attribute.class("absolute bottom-4 left-4 right-4"),
          ],
          [
            html.div([attribute.class("mb-2")], [
              html.span(
                [
                  attribute.class(
                    "inline-block px-3 py-1 bg-white/20 text-white text-sm font-bold tracking-wide backdrop-blur-sm",
                  ),
                ],
                [element.text(badge)],
              ),
            ]),
            html.h3(
              [
                attribute.class(
                  "text-xl font-bold text-white mb-2 tracking-wide",
                ),
                attribute.style("font-family", "'Dark Reborn', sans-serif"),
              ],
              [element.text(title)],
            ),
            html.p([attribute.class("text-gray-300 text-sm leading-relaxed")], [
              element.text(description),
            ]),
          ],
        ),
      ]),
    ],
  )
}
