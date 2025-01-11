# Manga API

This API provides various endpoints to fetch manga-related data, including home content, banners, recent releases, trending titles, and more. It's built with Next.js and utilizes the `MangaService` for data retrieval.

## Features

- Fetch home content
- Retrieve banner images
- Get recent releases
- Fetch trending titles
- Retrieve manga info, chapters, and volumes
- Get chapter pages for reading

## Installation

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd <repository-directory>
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

## Endpoints

### 1. **Home**

**Path:** `/api/[manga]=home`  
 **Method:** `GET`  
 **Description:** Fetch home content for the manga service.  
 **Example:**

```bash
curl http://localhost:3000/api/home
```

---

### 2. **Banners**

**Path:** `/api/[manga]=banners`  
 **Method:** `GET`  
 **Query Parameters:**

- `ids` (stringified array): A list of banner IDs.  
  **Description:** Retrieve banner images for the provided IDs.  
  **Example:**

```bash
curl http://localhost:3000/api/banners?ids=["berserkk.m2vv","dandadann.3r5x9"]
```

---

### 3. **Recent Releases**

**Path:** `/api/recent`  
 **Method:** `GET`  
 **Query Parameters:**

- `page` (integer): The page number (default: 1).
- `type` (string): Content type (`all`, `manga`, `manwah`, `manhua`) (default: `all`).
  **Description:** Fetch recent releases by type and page.  
  **Example:**

```bash
curl "http://localhost:3000/api/recent?page=2&type=manga"
```

---

### 4. **Trending**

**Path:** `/api/trending`  
 **Method:** `GET`  
 **Query Parameters:**

- `page` (integer): The page number (default: 1).  
  **Description:** Fetch trending manga titles by page.  
  **Example:**

```bash
curl "http://localhost:3000/api/trending?page=1"
```

---

### 5. **Manga Info**

**Path:** `/api/info`  
 **Method:** `GET`  
 **Query Parameters:**

- `id` (string): The manga ID.
  **Description:** Retrieve detailed information about a specific manga.  
  **Example:**

```bash
curl http://localhost:3000/api/info?id=dandadann.3r5x9
```

---

### 6. **Chapters**

**Path:** `/api/chapters`  
 **Method:** `GET`  
 **Query Parameters:**

- `id` (string): The manga ID.
- `lang` (string): Language code (default: `en`).
  **Description:** Retrieve chapters of a specific manga.  
  **Example:**

```bash
curl "http://localhost:3000/api/chapters?id=dandadann.3r5x9&lang=en"
```

---

### 7. **Volumes**

**Path:** `/api/volumes`  
 **Method:** `GET`  
 **Query Parameters:**

- `id` (string): The manga ID.
- `lang` (string): Language code (default: `en`).
  **Description:** Retrieve volumes of a specific manga.  
  **Example:**

```bash
curl "http://localhost:3000/api/volumes?id=dandadann.3r5x9&lang=en"
```

---

### 8. **Chapters with IDs**

**Path:** `/api/chapters-with-ids`  
 **Method:** `GET`  
 **Query Parameters:**

- `id` (string): The manga ID.
- `lang` (string): Language code (default: `en`).
  **Description:** Retrieve chapters with associated IDs for a specific manga.  
  **Example:**

```bash
curl "http://localhost:3000/api/chapters-with-ids?id=dandadann.3r5x9&lang=en"
```

---

### 9. **Read**

**Path:** `/api/read`  
 **Method:** `GET`  
 **Query Parameters:**

- `id` (string): The chapter ID.
  **Description:** Retrieve pages of a specific chapter for reading.  
  **Example:**

```bash
curl "http://localhost:3000/api/read?id=3911066"
```

---

## Error Handling

The API returns an error response with the following structure on failure:

```json
{
  "error": "Error message"
}
```

## Contribution

Feel free to contribute to this project by submitting issues or pull requests. Ensure all changes are thoroughly tested before submission.

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.
