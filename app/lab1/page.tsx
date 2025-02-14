"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";

interface Inputs {
  a: string;
  b: string;
  c: string;
  n: string;
  i: string;
  d: string;
  m: string;
}

interface PageData {
  title: string;
  fields: { name: keyof Inputs; label: string }[];
  buttonLabel: string;
  apiType: string;
  imageSrc: string;
}

const pageData: PageData[] = [
  {
    title: "solve Y1",
    fields: [
      { name: "a", label: "a" },
      { name: "b", label: "b" },
      { name: "c", label: "c" }
    ],
    buttonLabel: "solve Y1",
    apiType: "FirstFc",
    imageSrc: "/1image.png"
  },
  {
    title: "solve y",
    fields: [
      { name: "i", label: "i" },
      { name: "d", label: "d" },
      { name: "m", label: "m" }
    ],
    buttonLabel: "solve y",
    apiType: "SecondFc",
    imageSrc: "/2image.png"
  },
  {
    title: "solve f",
    fields: [
      { name: "n", label: "n" },
      { name: "c", label: "c" }
    ],
    buttonLabel: "solve f",
    apiType: "ThirdFc",
    imageSrc: "/3image.png"
  }
];

export default function MathSolver() {
  const [inputs, setInputs] = useState<Inputs>({
    a: '',
    b: '',
    c: '',
    n: '',
    i: '',
    d: '',
    m: ''
  });

  const [page, setPage] = useState<number>(0);
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInputs((prevInputs) => ({
      ...prevInputs,
      [name]: value, 
    }));
  };

  const calculate = async () => {
    setLoading(true);
    setResult(null);

    const { apiType, fields } = pageData[page];
    const params = fields.reduce((acc, { name }) => {
      acc[name] = Number(inputs[name]);
      return acc;
    }, {} as Record<string, number>);

    try {
      const response = await fetch("/api/solve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: apiType, params }),
      });

      const data = await response.json();
      if (response.ok) {
        setResult(`Result: ${data.result}`);
      } else {
        setResult(`Error: ${data.error}`);
      }
    } catch (error) {
      setResult("Server Error");
    } finally {
      setLoading(false);
    }
  };

  // Function to save data to a file
  const saveToFile = () => {
    const fileData = JSON.stringify(inputs);
    const blob = new Blob([fileData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'inputs.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Function to load data from a file
  const loadFromFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const fileContent = event.target?.result as string;
          const parsedData = JSON.parse(fileContent);
          setInputs(parsedData);
        } catch (error) {
          alert('Error reading the file');
        }
      };
      reader.readAsText(file);
    }
  };

  // Function to clear input fields
  const clearInputs = () => {
    setInputs({
      a: '',
      b: '',
      c: '',
      n: '',
      i: '',
      d: '',
      m: ''
    });
    setResult(null);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white p-10">
      {/* Page switching buttons */}
      <div className="flex justify-center space-x-6 mb-12">
        {pageData.map((_, index) => (
          <Button
            key={index}
            onClick={() => setPage(index)}
            className={`px-8 py-4 text-lg ${page === index ? "bg-blue-600 text-white shadow-lg" : "bg-gray-800 border border-gray-600"}`}
          >
            {index + 1}
          </Button>
        ))}
      </div>

      <Card className="w-full max-w-5xl p-12 shadow-2xl bg-gray-800 text-white">
        <CardContent className="space-y-10">
          <h2 className="text-5xl font-bold text-center">{pageData[page].title}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {pageData[page].fields.map(({ name, label }) => (
              <Label key={name} className="text-lg">
                {label}
                <Input
                  name={name}
                  value={inputs[name]}
                  onChange={handleChange}
                  className="bg-gray-700 text-white border-gray-600 text-lg p-3 mt-2"
                  placeholder={`Enter ${label}`}
                />
              </Label>
            ))}
          </div>
          <Button onClick={calculate} className="w-full py-4 text-xl bg-blue-500 text-white mt-6">
            {loading ? "Calculating..." : pageData[page].buttonLabel}
          </Button>
          {result && <p className="text-center text-xl mt-6">{result}</p>}

          {/* Buttons for saving, loading, and clearing */}
          <div className="flex justify-center space-x-6 mt-8">
            <Button onClick={saveToFile} className="bg-green-600 text-white">Save to File</Button>
            <label htmlFor="file-upload" className="bg-gray-600 text-white p-3 cursor-pointer">
              Upload File
            </label>
            <input
              id="file-upload"
              type="file"
              onChange={loadFromFile}
              className="hidden"
            />
            <Button onClick={clearInputs} className="bg-red-600 text-white">Clear</Button>
          </div>

          <div className="flex justify-center mt-8">
            <Image src={pageData[page].imageSrc} alt={`Example ${page + 1}`} width={600} height={300} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
