import prisma from "../prisma/prismaClient.js";

export const createQuestions = async (req, res) => {
  try {
    const { type, difficulty, title, description, example, constraints, testCases } = req.body;

    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

    const difficultyEnum = difficulty.trim().toUpperCase();

    const examplesJson = example ? [{ description: example }] : [];

    const formattedTestCases = testCases.map(tc => {
      let parsedInput = tc.input;
      let parsedExpected = tc.output;
      
      if (typeof tc.input === 'string' && (tc.input.trim().startsWith('[') || tc.input.trim().startsWith('{'))) {
        try {
          parsedInput = JSON.parse(tc.input);
        } catch (e) {
          parsedInput = tc.input;
        }
      }
      
      if (typeof tc.output === 'string' && (tc.output.trim().startsWith('[') || tc.output.trim().startsWith('{'))) {
        try {
          parsedExpected = JSON.parse(tc.output);
        } catch (e) {
          const num = Number(tc.output);
          parsedExpected = isNaN(num) ? tc.output : num;
        }
      } else if (typeof tc.output === 'string') {
        const num = Number(tc.output);
        parsedExpected = isNaN(num) ? tc.output : num;
      }
      
      return {
        input: parsedInput,
        expected: parsedExpected
      };
    });

    const question = await prisma.question.create({
      data: {
        title,
        slug,
        difficulty: difficultyEnum,
        description,
        examples: examplesJson,
        constraints,
        testCases: formattedTestCases,
        topics: {
          connectOrCreate: [
            {
              where: { name: type },
              create: {
                name: type,
                slug: type.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
              },
            },
          ],
        },
      },
      include: { topics: true },
    });

    res.status(201).json({ success: true, question });
  } catch (error) {
    console.error("Create question error:", error);
    res.status(500).json({ error: "Failed to create question", details: error.message });
  }
};


export const getQuestions = async (req, res) => {
  try {
    const questions = await prisma.question.findMany({
      select: {
        id: true,
        title: true,
        difficulty: true,
        topics: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    const formattedQuestions = questions.map((q) => ({
      id: q.id,
      title: q.title,
      difficulty: q.difficulty,
      type: q.topics?.[0]?.name || "No Topic",
    }));

    res.status(200).json({
      success: true,
      questions: formattedQuestions,
    });
  } catch (error) {
    console.error("Get questions error:", error);
    res.status(500).json({
      error: "Failed to retrieve questions",
      details: error.message,
    });
  }
};

export const getQuestionById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const question = await prisma.question.findUnique({
      where: { id },
      include: {
        topics: {
          select: {
            name: true,
            slug: true,
          },
        },
      },
    });

    if (!question) {
      return res.status(404).json({
        error: "Question not found",
      });
    }

    const formattedTestCases = question.testCases.map(tc => {
      if ('expected' in tc) {
        return tc;
      }
      
      let parsedInput = tc.input;
      let parsedExpected = tc.output;
      
      if (typeof tc.input === 'string' && (tc.input.trim().startsWith('[') || tc.input.trim().startsWith('{'))) {
        try {
          parsedInput = JSON.parse(tc.input);
        } catch (e) {
          parsedInput = tc.input;
        }
      }
      
      if (typeof tc.output === 'string' && (tc.output.trim().startsWith('[') || tc.output.trim().startsWith('{'))) {
        try {
          parsedExpected = JSON.parse(tc.output);
        } catch (e) {
          const num = Number(tc.output);
          parsedExpected = isNaN(num) ? tc.output : num;
        }
      } else if (typeof tc.output === 'string') {
        const num = Number(tc.output);
        parsedExpected = isNaN(num) ? tc.output : num;
      }
      
      return {
        input: parsedInput,
        expected: parsedExpected
      };
    });

    res.status(200).json({
      success: true,
      question: {
        ...question,
        testCases: formattedTestCases
      },
    });
  } catch (error) {
    console.error("Get question by ID error:", error);
    res.status(500).json({
      error: "Failed to retrieve question",
      details: error.message,
    });
  }
};
