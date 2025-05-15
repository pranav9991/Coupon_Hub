// Online Java Compiler
// Use this editor to write, compile and run your Java code online

import java.util.*;

class Student{
    int roll;
    String name;
    double mark;
    
    Student(int roll,String name,double mark)
    {
        this.roll=roll;
        this.name=name;
        this.mark=mark;
    }
    
    void displayStudent()
    {
        System.out.println(this.roll+" "+this.name+" "+this.mark);
    }
}

class HelloWorld {
    public static void main(String[] args) {
        int roll;
        String name;
        double mark;
        Scanner sc=new Scanner(System.in);
        roll=sc.nextInt();
        name=sc.next();
        mark=sc.nextDouble();
        
        
        Student s1=new Student(roll,name,mark);
        s1.displayStudent();
        }
}