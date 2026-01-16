# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - button "Toggle night mode (Space)" [ref=e2] [cursor=pointer]:
    - img [ref=e3]
  - generic [ref=e5]:
    - banner [ref=e6]:
      - generic [ref=e7]:
        - heading "Octovo Zine Maker" [level=1] [ref=e8]
        - paragraph [ref=e9]: Convert PDF files into printable 8-page zines
    - generic [ref=e11]:
      - button "Upload PDF file" [ref=e12] [cursor=pointer]:
        - img [ref=e13]
        - heading "Drop PDF here or browse files" [level=3] [ref=e16]
        - paragraph [ref=e17]: Supports 8 or 16 page layouts
      - paragraph
    - generic [ref=e19]:
      - generic [ref=e20]:
        - heading "Page Scale" [level=3] [ref=e21]
        - paragraph [ref=e22]: Adjust the size of your zine pages for optimal printing
      - generic [ref=e23]:
        - generic [ref=e24]:
          - generic [ref=e25]: Scale
          - generic [ref=e26]: 100%
        - slider "Scale" [ref=e27] [cursor=pointer]: "100"
        - generic [ref=e28]:
          - button "Set scale to 50%" [ref=e29]: 50%
          - button "Set scale to 100%" [ref=e30]: 100%
          - button "Set scale to 200%" [ref=e31]: 200%
      - option "A4 (210 × 297 mm)" [selected]
      - option "A3 (297 × 420 mm)"
      - option "Letter (8.5 × 11 in)"
      - option "Legal (8.5 × 14 in)"
      - option "A5 (148 × 210 mm)"
      - option "Landscape" [selected]
      - option "Portrait"
      - tabpanel [ref=e32]: Upload a PDF to transform these placeholders into your zine pages
```