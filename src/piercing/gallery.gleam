import gleam/list
import gleam/string
import lustre/attribute
import lustre/element.{type Element}
import lustre/element/html
import lustre/event

const categories = [
  #(
    "Perforaciones de oreja",
    Ear(EarAll),
    [
      #("Lóbulo", Ear(Lobulo)),
      #("Hélix", Ear(Helix)),
      #("Industrial", Ear(Industrial)),
      #("Conch", Ear(Conch)),
      #("Tragus", Ear(Tragus)),
      #("Daith", Ear(Daith)),
      #("Flat", Ear(Flat)),
    ],
  ),
  #(
    "Perforaciones faciales",
    Facial(FacialAll),
    [
      #("Nostril", Facial(Nostril)),
      #("Septum", Facial(Septum)),
      #("Labret", Facial(Labret)),
      #("Ceja", Facial(Ceja)),
      #("Bridge", Facial(Bridge)),
      #("Medusa", Facial(Medusa)),
      #("Venom", Facial(Venom)),
      #("Lengua", Facial(Lengua)),
    ],
  ),
  #(
    "Perforaciones corporales",
    Body(BodyAll),
    [
      #("Ombligo", Body(Ombligo)),
      #("Superficie", Body(Superficie)),
      #("Microdermal", Body(Microdermal)),
    ],
  ),
]

pub type GalleryFilter {
  All
  Ear(Ear)
  Facial(Facial)
  Body(Body)
}

pub type Facial {
  FacialAll
  Nostril
  Septum
  Labret
  Ceja
  Bridge
  Medusa
  Venom
  Lengua
}

pub type Body {
  BodyAll
  Ombligo
  Superficie
  Microdermal
}

pub type Ear {
  EarAll
  Lobulo
  Helix
  Industrial
  Conch
  Tragus
  Daith
  Flat
}

pub fn gallery_page(
  filter filter: GalleryFilter,
  filter_event filter_event: fn(GalleryFilter) -> a,
  open_modal_event open_modal_event: fn(String, String) -> a,
) -> Element(a) {
  case filter {
    All -> gallery_home_page(filter_event)
    _ -> gallery_filtered_page(filter, filter_event, open_modal_event)
  }
}

fn gallery_home_page(filter_event: fn(GalleryFilter) -> a) -> Element(a) {
  html.div([attribute.class("min-h-screen")], [
    html.div([attribute.class("px-4 sm:px-6 lg:px-8 py-8 sm:py-12")], [
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
        html.div(
          [attribute.class("grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12")],
          [
            gallery_section_card(
              "Perforaciones de oreja",
              "Hélix, tragus, conch y más",
              Ear(EarAll),
              "/priv/static/lobulo.jpeg",
              filter_event,
            ),
            gallery_section_card(
              "Perforaciones faciales",
              "Nariz, cejas, labios y lengua",
              Facial(FacialAll),
              "/priv/static/nostril-1.jpeg",
              filter_event,
            ),
            gallery_section_card(
              "Perforaciones corporales",
              "Ombligo y dermales",
              Body(BodyAll),
              "/priv/static/ombligo.jpeg",
              filter_event,
            ),
          ],
        ),
      ]),
    ]),
  ])
}

fn gallery_section_card(
  title: String,
  description: String,
  filter: GalleryFilter,
  image_src: String,
  filter_event: fn(GalleryFilter) -> a,
) -> Element(a) {
  html.div(
    [
      attribute.class(
        "gallery-section-card relative group cursor-pointer overflow-hidden",
      ),
    ],
    [
      html.div([attribute.class("relative aspect-[4/3] overflow-hidden")], [
        html.img([
          attribute.src(image_src),
          attribute.class(
            "w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out",
          ),
          attribute.alt(title),
        ]),
        html.div(
          [
            attribute.class(
              "absolute inset-0 flex flex-col justify-end p-6 text-white",
            ),
            attribute.style(
              "background",
              "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.3) 20%, rgba(0,0,0,0.9) 100%)",
            ),
          ],
          [
            html.h3(
              [
                attribute.class(
                  "text-2xl lg:text-3xl font-bold mb-2 tracking-wide transform group-hover:scale-105 transition-transform duration-300",
                ),
                attribute.style("font-family", "'Dark Reborn', sans-serif"),
              ],
              [element.text(title)],
            ),
            html.p(
              [
                attribute.class(
                  "text-lg opacity-90 group-hover:opacity-100 transition-opacity duration-300",
                ),
              ],
              [element.text(description)],
            ),
          ],
        ),
      ]),
      html.button(
        [
          attribute.class("absolute inset-0 w-full h-full"),
          event.on_click(filter_event(filter)),
        ],
        [],
      ),
    ],
  )
}

fn gallery_filtered_page(
  filter: GalleryFilter,
  filter_event: fn(GalleryFilter) -> a,
  open_modal_event: fn(String, String) -> a,
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
                  "text-4xl sm:text-5xl lg:text-6xl font-bold text-center mb-8 sm:mb-12 text-white tracking-wide font-[Dark_Reborn]",
                ),
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
                    filter_sidebar(filter_event, filter),
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
  filter_event: fn(GalleryFilter) -> a,
  current_filter: GalleryFilter,
) -> Element(a) {
  html.div(
    [attribute.class("space-y-6")],
    categories
      |> list.map(fn(category) {
        let #(title, filter, items) = category
        collapsible_category_section(
          title,
          items,
          filter,
          filter_event,
          current_filter,
        )
      }),
  )
}

fn collapsible_category_section(
  title: String,
  items: List(#(String, GalleryFilter)),
  items_filter: GalleryFilter,
  filter_event: fn(GalleryFilter) -> a,
  current_filter: GalleryFilter,
) -> Element(a) {
  html.div([], [
    html.button(
      [
        attribute.class(
          "w-full text-left flex items-center justify-between mb-4 hover:bg-white/5 transition-colors duration-200 p-2 rounded",
        ),
      ],
      [
        html.h2(
          [
            attribute.class(
              "text-2xl font-bold text-white tracking-wide"
              <> case current_filter, items_filter {
                Body(_), Body(_) | Ear(_), Ear(_) | Facial(_), Facial(_) ->
                  " font-bold text-shadow-[0_0_10px_rgba(255,255,255,0.7)]"
                _, _ -> "text-shadow-none!"
              },
            ),
            attribute.style("font-family", "'Dark Reborn', sans-serif"),
            event.on_click(filter_event(items_filter)),
          ],
          [
            element.text(case current_filter, items_filter {
              Body(_), Body(_) | Ear(_), Ear(_) | Facial(_), Facial(_) ->
                "" <> string.drop_start(title, 1) <> " ✧"
              _, _ -> title
            }),
          ],
        ),
      ],
    ),
    case current_filter, items_filter {
      Body(_), Body(_) | Ear(_), Ear(_) | Facial(_), Facial(_) ->
        filter_category_list(items, filter_event, current_filter)
      _, _ -> html.div([], [])
    },
  ])
}

fn filter_category_list(
  items: List(#(String, GalleryFilter)),
  filter_event,
  current_filter: GalleryFilter,
) {
  html.div(
    [attribute.class("ml-10 space-y-2")],
    items
      |> list.map(fn(item) {
        let #(name, filter) = item
        let is_active = filter == current_filter
        html.button(
          [
            attribute.class(
              "block w-full text-left px-3 py-2 text-white hover:bg-white/30 transition-all duration-300"
              <> case is_active {
                True -> " pl-3 bg-white/20 font-bold"
                False -> ""
              },
            ),
            event.on_click(filter_event(filter)),
          ],
          [
            element.text(case is_active {
              True -> "✧ " <> name
              False -> name
            }),
          ],
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
    // Ear piercings
    #("/priv/static/lobulo.jpeg", "Perforación de lóbulo", Ear(Lobulo)),
    #("/priv/static/flat.jpeg", "Perforación flat", Ear(Flat)),
    #("/priv/static/industrial.jpeg", "Perforación industrial", Ear(Industrial)),
    #("/priv/static/oreja.jpeg", "Perforación hélix", Ear(Helix)),

    // Facial piercings
    #("/priv/static/nostril-1.jpeg", "Perforación nostril", Facial(Nostril)),
    #("/priv/static/nostril-2.jpeg", "Perforación nostril", Facial(Nostril)),
    #("/priv/static/nostril-3.jpeg", "Perforación nostril", Facial(Nostril)),
    #("/priv/static/nostril-4.jpeg", "Perforación nostril", Facial(Nostril)),
    #("/priv/static/nostril-5.jpeg", "Perforación nostril", Facial(Nostril)),
    #("/priv/static/ceja-1.heic", "Perforación de ceja", Facial(Ceja)),
    #("/priv/static/ceja-2.jpeg", "Perforación de ceja", Facial(Ceja)),
    #("/priv/static/venom.jpeg", "Perforación venom", Facial(Venom)),
    #("/priv/static/lengua-1.jpeg", "Perforación de lengua", Facial(Lengua)),
    #("/priv/static/lengua-2.jpeg", "Perforación de lengua", Facial(Lengua)),

    // Body piercings  
    #("/priv/static/ombligo.jpeg", "Perforación de ombligo", Body(Ombligo)),
    #("/priv/static/microdermal.jpeg", "Microdermal", Body(Microdermal)),
    #("/priv/static/cuerpo.heic", "Surface", Body(Superficie)),
  ]

  case filter {
    All -> all_images
    // Broad category filters
    Ear(EarAll) ->
      all_images
      |> list.filter(fn(img) {
        let #(_, _, img_filter) = img
        case img_filter {
          Ear(_) -> True
          _ -> False
        }
      })
    Facial(FacialAll) ->
      all_images
      |> list.filter(fn(img) {
        let #(_, _, img_filter) = img
        case img_filter {
          Facial(_) -> True
          _ -> False
        }
      })
    Body(BodyAll) ->
      all_images
      |> list.filter(fn(img) {
        let #(_, _, img_filter) = img
        case img_filter {
          Body(_) -> True
          _ -> False
        }
      })
    // Specific subcategory filters
    specific_filter ->
      all_images
      |> list.filter(fn(img) {
        let #(_, _, img_filter) = img
        img_filter == specific_filter
      })
  }
}
