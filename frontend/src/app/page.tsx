"use client";
import React, { useState } from "react";
import axios from "axios";
import {
  Container,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";

import { useTheme } from "@mui/material/styles";

export default function Home() {
  const theme = useTheme();
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [cvDataList, setCvDataList] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    setSelectedFiles(Array.from(e.target.files));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedFiles.length === 0) return;

    setLoading(true);
    setError("");
    setCvDataList([]);

    const formData = new FormData();
    selectedFiles.forEach((file) => {
      formData.append("files", file);
    });

    try {
      const { data } = await axios.post(
        "http://192.168.4.114:5001/process_cv",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      setCvDataList(data); // Assuming backend returns an array of parsed CV data
    } catch (err) {
      setError(err.response?.data?.error || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const downloadCSV = () => {
    if (cvDataList.length === 0) return;

    // Define CSV headers
    const headers = ["名前", "  年齢  ", "メール", "住所", "学歴", "職務経験"];

    // Convert `cvDataList` to CSV string with proper escaping
    const csvContent = [
      headers.join(","), // Add headers
      ...cvDataList.map((cv) =>
        [
          `"${cv.name || "N/A"}"`,
          `"${cv.age || "N/A"}"`,
          `"${cv.email || "N/A"}"`,
          `"${cv.address || "N/A"}"`,
          `"${cv.education || "N/A"}"`,
          `"${cv.work_experience?.replace(/\n/g, " ") || "N/A"}"`, // Replace newlines
        ].join(",")
      ),
    ].join("\n");

    // Add UTF-8 BOM for correct encoding in Excel
    const bom = "\uFEFF";
    const blob = new Blob([bom + csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    // Create a downloadable link
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "cv_data.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Container
      maxWidth={false}
      sx={{ px: { xs: 2, sm: 6, md: 8 } }}
      className="py-4"
    >
      <Typography variant="h4" gutterBottom>
        複数の履歴書を処理する
      </Typography>
      <form
        onSubmit={handleSubmit}
        style={{ flexDirection: "column", gap: "1rem" }}
      >
        <Button variant="contained" component="label" sx={{ mr: 2 }}>
          ファイルを選択
          <input type="file" multiple hidden onChange={handleFileChange} />
        </Button>
        <br />

        {selectedFiles.length > 0 && (
          <List>
            {selectedFiles.map((file, index) => (
              <ListItem key={index}>
                <ListItemText primary={file.name} />
              </ListItem>
            ))}
          </List>
        )}

        <div className="flex flex-row space-x-4 mt-4 mb-4">
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading}
          >
            {loading ? "処理中... " : "アップロード"}
          </Button>

          {cvDataList.length !== 0 && (
            <Button variant="contained" color="primary" onClick={downloadCSV}>
              ダウンロード
            </Button>
          )}
        </div>
      </form>

      {/* Render Table if Data Exists */}
      {cvDataList.length > 0 && (
        <TableContainer
          component={Paper}
          sx={{ width: "100%", boxShadow: 3, borderRadius: 2 }}
        >
          <Typography
            variant="h6"
            sx={{ p: 2, backgroundColor: "#f5f5f5", fontWeight: "bold" }}
          >
            処理済みのCVデータ
          </Typography>
          <Table>
            <TableHead sx={{ backgroundColor: "#1976d2" }}>
              <TableRow>
                {["名前", "  年齢  ", "メール", "住所", "学歴", "職務経験"].map(
                  (header) => (
                    <TableCell
                      key={header}
                      sx={{ color: "white", fontWeight: "bold" }}
                    >
                      {header}
                    </TableCell>
                  )
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {cvDataList.map((cvData, index) => (
                <TableRow
                  key={index}
                  sx={{ "&:nth-of-type(odd)": { backgroundColor: "#f9f9f9" } }}
                >
                  <TableCell>{cvData.name || "N/A"}</TableCell>
                  <TableCell>{cvData.age || "N/A"}</TableCell>
                  <TableCell>{cvData.email || "N/A"}</TableCell>
                  <TableCell>{cvData.address || "N/A"}</TableCell>
                  <TableCell>{cvData.education || "N/A"}</TableCell>
                  <TableCell>{cvData.work_experience || "N/A"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Container>
  );
}
