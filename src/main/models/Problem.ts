export class Problem {
  constructor(
    public id: number,
    public name: string,
    public description: string,
    public difficulty: string,
    public category: string,
    public points: number,
    public solvedCount: number,
  ) {}

  // Method to display problem details
  displayDetails() {
    return `Problem ID: ${this.id}\nName: ${this.name}\nDescription: ${this.description}\nDifficulty: ${this.difficulty}\nCategory: ${this.category}\nPoints: ${this.points}\nSolved Count: ${this.solvedCount}`;
  }
}