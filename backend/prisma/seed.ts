import "dotenv/config"; import { PrismaClient } from "../src/generated/prisma/client"; import { PrismaPg } from "@prisma/adapter-pg"; import 
bcrypt from "bcryptjs"; const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL!
});
const prisma = new PrismaClient({ adapter
});
async function main() { console.log("Starting seed...");
    // Categories
    const categories = await Promise.all([ "Fast Food", "Chinese", "Italian", "Desi", "Cafe" ].map(name => prisma.category.upsert({ 
            where:{name}, update:{}, create:{name}
        })
    ));
    // Admin User
    const password = await bcrypt.hash( "admin123", 10 ); const admin = await prisma.user.upsert({ where:{ email:"admin@mytreats.com"
        },
        update:{}, create:{ name:"Admin", email:"admin@mytreats.com", password, role:"ADMIN"
        }
    });
    // Restaurants
    const restaurants = [ { name:"Karachi Biryani House", description:"Traditional Pakistani food", address:"Main Street", city:"Karachi", 
            categoryId: categories[3].id
        },
        { name:"Italian Pizza Corner", description:"Fresh Italian pizzas", address:"Food Street", city:"Lahore", categoryId: categories[2].id
        },
        { name:"Dragon Chinese Restaurant", description:"Chinese cuisine", address:"Blue Area", city:"Islamabad", categoryId: categories[1].id
        },
        { name:"Coffee Cafe", description:"Coffee and snacks", address:"Centaurus Mall", city:"Islamabad", categoryId: categories[4].id
        }
    ]; for(const restaurant of restaurants){ await prisma.restaurant.create({ data:restaurant
        });
    }
    console.log("Seed completed");
}
main() .then(()=>{ console.log("Done"); prisma.$disconnect();
})
.catch(async(e)=>{ console.error(e); await prisma.$disconnect(); process.exit(1);
});
