import { test, expect } from "@playwright/test";

test.describe("Public site — core journeys", () => {
  test("home page renders the hero and brand", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/RateAI/);
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      /right AI/i
    );
    // Primary nav
    await expect(page.getByRole("link", { name: "Discover" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Blog" })).toBeVisible();
  });

  test("blog index renders", async ({ page }) => {
    await page.goto("/blog");
    await expect(page).toHaveTitle(/Blog/);
    await expect(
      page.getByRole("heading", { name: /Field notes on AI tools/i })
    ).toBeVisible();
  });

  test("search page is a browsable directory", async ({ page }) => {
    await page.goto("/search");
    await expect(
      page.getByPlaceholder(/Search AI tools/i)
    ).toBeVisible();
  });

  test("nav links route correctly", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Blog" }).first().click();
    await expect(page).toHaveURL(/\/blog$/);

    await page.getByRole("link", { name: "Leaderboard" }).first().click();
    await expect(page).toHaveURL(/\/leaderboard$/);
  });

  test("footer shows the ownership credit", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByText(/Kunamix Digital Solutions/i).first()
    ).toBeVisible();
  });

  test("robots.txt and sitemap.xml are served", async ({ request }) => {
    const robots = await request.get("/robots.txt");
    expect(robots.ok()).toBeTruthy();
    expect(await robots.text()).toContain("Sitemap:");

    const sitemap = await request.get("/sitemap.xml");
    expect(sitemap.ok()).toBeTruthy();
    expect(await sitemap.text()).toContain("<urlset");
  });
});
