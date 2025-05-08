import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import User from "@/Model/userModel";

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body = await request.json();
    const { username, name, email, number, password, grade, stream, role } = body;

    // Validate required fields
    if (!username || !name || !email || !number || !password || !grade || !stream) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Connect to the database
    await dbConnect();

    // Check if user with email or username already exists
    const existingUserByEmail = await User.findOne({ email });
    if (existingUserByEmail) {
      return NextResponse.json(
        { success: false, message: "Email already registered" },
        { status: 409 }
      );
    }

    const existingUserByUsername = await User.findOne({ username });
    if (existingUserByUsername) {
      return NextResponse.json(
        { success: false, message: "Username already taken" },
        { status: 409 }
      );
    }

    const existingUserByNumber = await User.findOne({ number });
    if (existingUserByNumber) {
      return NextResponse.json(
        { success: false, message: "Phone number already registered" },
        { status: 409 }
      );
    }

    // Create the user
    const user = await User.create({
      username,
      name,
      email,
      number,
      password,
      grade,
      stream,
      role: role || "student", // Default to student if not specified
      isVerified: false,       // User needs to verify email
    });

    // TODO: Send verification email - implement this in a separate function

    // Return success response without sending password
    const userResponse = user.toObject();
    delete userResponse.password;

    return NextResponse.json(
      {
        success: true,
        message: "Registration successful. Please check your email to verify your account.",
        user: userResponse,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Registration failed" },
      { status: 500 }
    );
  }
}
