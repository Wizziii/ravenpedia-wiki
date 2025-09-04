import {PageLayout, SharedLayout} from "./quartz/cfg"
import * as Component from "./quartz/components"

// components shared across all pages
export const sharedPageComponents: SharedLayout = {
    head: Component.Head(),
    header: [],
    afterBody: [],
    footer: Component.Footer({
        links: {
            "Impressum": "/Impressum",
            "Datenschutz": "/Datenschutz",
            "Discord-Community": "https://discord.gg/9VeHUXx8",
        },
    }),
}

const explorerConfig = Component.Explorer({
    filterFn: (node) => {
        const omit = new Set(["impressum", "datenschutz", "test"]) // Exclude specific nodes from the explorer
        return !omit.has(node.displayName.toLowerCase())
    },
    sortFn: (a, b) => {
        const aSort = (a as any).data?.frontmatter?.sort;
        const bSort = (b as any).data?.frontmatter?.sort;
        
        console.log({
          a: a.displayName,
          aSort,
          b: b.displayName,
          bSort,
        })
    
        // Sort order: folders first, then files.
        if ((!a.isFolder && !b.isFolder) || (a.isFolder && b.isFolder)) {
          if (aSort !== undefined && bSort !== undefined) {
            if (aSort < bSort) return -1
            if (aSort > bSort) return 1
          } else if (aSort !== undefined) {
            return -1
          } else if (bSort !== undefined) {
            return 1
          }
    
          return a.displayName.localeCompare(b.displayName, undefined, {
            numeric: true,
            sensitivity: "base",
          })
        }
    
        if (!a.isFolder && b.isFolder) {
          return 1
        } else {
          return -1
        }
      },
})

// components for pages that display a single page (e.g. a single note)
export const defaultContentPageLayout: PageLayout = {
    beforeBody: [
        Component.Breadcrumbs(),
        Component.ArticleTitle(),
        Component.ContentMeta(),
        Component.TagList(),
    ],
    left: [
        Component.PageTitle(),
        Component.MobileOnly(Component.Spacer()),
        Component.Search(),
        Component.Darkmode(),
        Component.DesktopOnly(explorerConfig),
    ],
    right: [
        Component.Graph(),
        Component.DesktopOnly(Component.TableOfContents()),
        Component.DesktopOnly(Component.Backlinks()),
    ],
}

// components for pages that display lists of pages  (e.g. tags or folders)
export const defaultListPageLayout: PageLayout = {
    beforeBody: [
        Component.Breadcrumbs(),
        Component.ArticleTitle(),
        Component.ContentMeta(),
        Component.TagList(),
    ],
    left: [
        Component.PageTitle(),
        Component.MobileOnly(Component.Spacer()),
        Component.Search(),
        Component.Darkmode(),
        Component.DesktopOnly(explorerConfig),
    ],
    right: [
        Component.Graph(),
        Component.DesktopOnly(Component.TableOfContents()),
        Component.DesktopOnly(Component.Backlinks()),
    ],
}
