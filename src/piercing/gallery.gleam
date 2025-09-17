import gleam/list
import lustre/attribute
import lustre/element.{type Element}
import lustre/element/html
import lustre/event

pub type GalleryFilter {
  All
  Ear
  Facial
  Body
  Jewelry
}

pub fn gallery_page(
  filter: GalleryFilter,
  filter_event filter_event,
  open_modal_event open_modal_event,
) {
  html.div(
    [
      attribute.class("min-h-screen"),
    ],
    [
      html.div(
        [
          attribute.class("px-4 sm:px-6 lg:px-8 py-8 sm:py-12"),
        ],
        [
          html.div([attribute.class("max-w-7xl mx-auto")], [
            html.h1(
              [
                attribute.class(
                  "text-4xl sm:text-5xl lg:text-6xl font-bold text-center mb-8 sm:mb-12 text-white tracking-wide",
                ),
                attribute.style("font-family", "'Dark Reborn', sans-serif"),
              ],
              [element.text("Explora nuestro trabajo")],
            ),
            // Filter Sidebar and Gallery Grid
            html.div(
              [attribute.class("flex flex-col lg:flex-row gap-8 lg:gap-12")],
              [
                // Sidebar with filters
                html.div([attribute.class("lg:w-64 flex-shrink-0")], [
                  html.div([attribute.class("sticky top-24")], [
                    filter_sidebar(filter, filter_event),
                  ]),
                ]),
                // Gallery Grid
                html.div([attribute.class("flex-1")], [
                  gallery_grid(filter, open_modal_event),
                ]),
              ],
            ),
          ]),
        ],
      ),
    ],
  )
}

fn filter_sidebar(
  current_filter: GalleryFilter,
  filter_event: fn(GalleryFilter) -> a,
) -> Element(a) {
  html.div([attribute.class("space-y-6")], [
    // Main categories
    html.div([], [
      html.h3(
        [
          attribute.class("text-2xl font-bold text-white mb-4 tracking-wide"),
          attribute.style("font-family", "'Dark Reborn', sans-serif"),
        ],
        [element.text("Perforaciones de oreja")],
      ),
      filter_category_list(
        [
          #("Lóbulo", Ear),
          #("Hélix", Ear),
          #("Industrial", Ear),
          #("Conch", Ear),
          #("Tragus", Ear),
          #("Daith", Ear),
        ],
        current_filter,
        filter_event,
      ),
    ]),
    html.div([], [
      html.h3(
        [
          attribute.class("text-2xl font-bold text-white mb-4 tracking-wide"),
          attribute.style("font-family", "'Dark Reborn', sans-serif"),
        ],
        [element.text("Faciales")],
      ),
      filter_category_list(
        [
          #("Nostril", Facial),
          #("Septum", Facial),
          #("Labret", Facial),
          #("Ceja", Facial),
          #("Bridge", Facial),
          #("Medusa", Facial),
        ],
        current_filter,
        filter_event,
      ),
    ]),
    html.div([], [
      html.h3(
        [
          attribute.class("text-2xl font-bold text-white mb-4 tracking-wide"),
          attribute.style("font-family", "'Dark Reborn', sans-serif"),
        ],
        [element.text("Corporales")],
      ),
      filter_category_list(
        [
          #("Ombligo", Body),
          #("Lengua", Body),
          #("Superficie", Body),
        ],
        current_filter,
        filter_event,
      ),
    ]),
    html.div([], [
      html.h3(
        [
          attribute.class("text-2xl font-bold text-white mb-4 tracking-wide"),
          attribute.style("font-family", "'Dark Reborn', sans-serif"),
        ],
        [element.text("Joyería")],
      ),
      filter_category_list(
        [
          #("Personalizada", Jewelry),
        ],
        current_filter,
        filter_event,
      ),
    ]),
  ])
}

fn filter_category_list(
  items: List(#(String, GalleryFilter)),
  current_filter: GalleryFilter,
  filter_event,
) {
  html.div(
    [attribute.class("space-y-2")],
    items
      |> list.map(fn(item) {
        let #(name, filter) = item
        let is_active = case current_filter {
          All -> False
          _ -> current_filter == filter
        }
        html.button(
          [
            attribute.class(case is_active {
              True ->
                "block w-full text-left px-3 py-2 text-white bg-white/20 border border-white/40 hover:bg-white/30 transition-all duration-300"
              False ->
                "block w-full text-left px-3 py-2 text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-300"
            }),
            event.on_click(filter_event(filter)),
          ],
          [element.text(name)],
        )
      }),
  )
}

fn gallery_grid(
  filter: GalleryFilter,
  open_modal_event: fn(String, String) -> b,
) -> Element(b) {
  let images = get_filtered_images(filter)
  html.div(
    [
      attribute.class(
        "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6",
      ),
    ],
    images
      |> list.map(fn(img) {
        let #(src, alt, _) = img
        html.button(
          [
            attribute.class(
              "aspect-square overflow-hidden border border-gray-700 hover:border-white transition-all duration-300 group cursor-pointer",
            ),
            event.on_click(open_modal_event(src, alt)),
          ],
          [
            html.img([
              attribute.src(src),
              attribute.class(
                "w-full h-full object-cover group-hover:scale-110 transition-transform duration-300",
              ),
              attribute.alt(alt),
            ]),
          ],
        )
      }),
  )
}

fn get_filtered_images(
  filter: GalleryFilter,
) -> List(#(String, String, GalleryFilter)) {
  let all_images = [
    #("/priv/static/oreja.jpeg", "Perforación de oreja - Hélix", Ear),
    #("/priv/static/oreja.jpeg", "Perforación de oreja - Lóbulo", Ear),
    #("/priv/static/oreja.jpeg", "Perforación de oreja - Tragus", Ear),
    #("/priv/static/oreja.jpeg", "Perforación de oreja - Conch", Ear),
    #("/priv/static/ceja.heic", "Perforación de ceja", Facial),
    #("/priv/static/lengua.jpeg", "Perforación de lengua", Facial),
    #("/priv/static/lengua.jpeg", "Perforación de labio", Facial),
    #("/priv/static/cuerpo.heic", "Perforación de ombligo", Body),
    #("/priv/static/cuerpo.heic", "Perforación superficie", Body),
    #("/priv/static/lengua.jpeg", "Joyería personalizada", Jewelry),
  ]

  case filter {
    All -> all_images
    specific_filter ->
      all_images
      |> list.filter(fn(img) {
        let #(_, _, img_filter) = img
        img_filter == specific_filter
      })
  }
}
