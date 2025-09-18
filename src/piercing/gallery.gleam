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

pub type CategoryType {
  EarCategory
  FacialCategory
  BodyCategory
  JewelryCategory
}

pub fn gallery_page(
  filter: GalleryFilter,
  filter_event filter_event: fn(GalleryFilter) -> a,
  open_modal_event open_modal_event: fn(String, String) -> a,
  collapsed_categories collapsed_categories: List(CategoryType),
  toggle_category_event toggle_category_event: fn(CategoryType) -> a,
) -> Element(a) {
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
                    filter_sidebar(
                      filter,
                      filter_event,
                      collapsed_categories,
                      toggle_category_event,
                    ),
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
  collapsed_categories: List(CategoryType),
  toggle_category_event: fn(CategoryType) -> a,
) -> Element(a) {
  html.div([attribute.class("space-y-6")], [
    collapsible_category_section(
      "Perforaciones de oreja",
      EarCategory,
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
      collapsed_categories,
      toggle_category_event,
    ),
    collapsible_category_section(
      "Faciales",
      FacialCategory,
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
      collapsed_categories,
      toggle_category_event,
    ),
    collapsible_category_section(
      "Corporales",
      BodyCategory,
      [
        #("Ombligo", Body),
        #("Lengua", Body),
        #("Superficie", Body),
      ],
      current_filter,
      filter_event,
      collapsed_categories,
      toggle_category_event,
    ),
    collapsible_category_section(
      "Joyería",
      JewelryCategory,
      [
        #("Personalizada", Jewelry),
      ],
      current_filter,
      filter_event,
      collapsed_categories,
      toggle_category_event,
    ),
  ])
}

fn collapsible_category_section(
  title: String,
  category_type: CategoryType,
  items: List(#(String, GalleryFilter)),
  current_filter: GalleryFilter,
  filter_event: fn(GalleryFilter) -> a,
  collapsed_categories: List(CategoryType),
  toggle_category_event: fn(CategoryType) -> a,
) -> Element(a) {
  let is_collapsed = list.contains(collapsed_categories, category_type)

  html.div([], [
    html.button(
      [
        attribute.class(
          "w-full text-left flex items-center justify-between mb-4 hover:bg-white/5 transition-colors duration-200 p-2 rounded",
        ),
        event.on_click(toggle_category_event(category_type)),
      ],
      [
        html.h3(
          [
            attribute.class("text-2xl font-bold text-white tracking-wide"),
            attribute.style("font-family", "'Dark Reborn', sans-serif"),
          ],
          [element.text(title)],
        ),
      ],
    ),
    case is_collapsed {
      True -> html.div([], [])
      False -> filter_category_list(items, filter_event)
    },
  ])
}

fn filter_category_list(items: List(#(String, GalleryFilter)), filter_event) {
  html.div(
    [attribute.class("ml-10 space-y-2")],
    items
      |> list.map(fn(item) {
        let #(name, filter) = item
        html.button(
          [
            attribute.class(
              "block w-full text-left px-3 py-2 text-white hover:bg-white/30 transition-all duration-300",
            ),
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
