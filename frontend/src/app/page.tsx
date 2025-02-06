// pages/index.js
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
  Input,
} from "@mui/material";

export default function Home() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [cvData, setCvData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;
    setLoading(true);
    setError("");
    setCvData(null);

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      // Adjust the API URL if necessary.
      const { data } = await axios.post("http://localhost:5001/process_cv", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setCvData(data);
    } catch (err) {
      setError(err.response?.data?.error || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const renderTable = () => {
    if (!cvData) return null;
    const fields = [
      { label: "Name", key: "name" },
      { label: "Age", key: "age" },
      { label: "Email", key: "email" },
      { label: "Address", key: "address" },
      { label: "Education", key: "education" },
      { label: "Work Experience", key: "work_experience" },
    ];
    return (
      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Field</TableCell>
              <TableCell>Value</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {fields.map((field) => (
              <TableRow key={field.key}>
                <TableCell>{field.label}</TableCell>
                <TableCell>{cvData[field.key]}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Process CV
      </Typography>
      <form onSubmit={handleSubmit}>
        <Input type="file" onChange={handleFileChange} />
        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={loading}
          sx={{ mt: 2 }}
        >
          {loading ? "Processing..." : "Upload"}
        </Button>
      </form>
      {error && (
        <Typography color="error" sx={{ mt: 2 }}>
          {error}
        </Typography>
      )}
      {renderTable()}
    </Container>
  );
}