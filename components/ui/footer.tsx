import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-[#e5e9fd] py-8 border-t-2 border-magenta-200">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-semibold text-lg mb-4 text-magenta-600">Mythenpark</h3>
            <p className="text-cyan-700">In shape since 1998</p>
            <p className="text-cyan-700 mt-2">Schwyz, Switzerland</p>
          </div>
          
          <div>
            <h3 className="font-semibold text-lg mb-4 text-magenta-600">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link href="/" className="text-cyan-600 hover:text-magenta-600 font-medium">Home</Link></li>
              <li><Link href="/about" className="text-cyan-600 hover:text-magenta-600 font-medium">About</Link></li>
              <li><Link href="/events" className="text-cyan-600 hover:text-magenta-600 font-medium">Events</Link></li>
              <li><Link href="/park-info" className="text-cyan-600 hover:text-magenta-600 font-medium">Park Info</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-lg mb-4 text-magenta-600">Contact</h3>
            <p className="text-cyan-700">Email: <a href="mailto:info@mythenpark.ch" className="text-magenta-600 hover:text-magenta-700 font-semibold">info@mythenpark.ch</a></p>
            <div className="flex space-x-4 mt-4">
              <a href="https://instagram.com/mythenpark" target="_blank" rel="noopener noreferrer" className="text-cyan-600 hover:text-magenta-600">
                <span className="sr-only">Instagram</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
          </div>
        </div>
        
        <div className="border-t border-magenta-200 mt-8 pt-8 text-center text-cyan-600 text-sm">
          <p>&copy; {currentYear} Mythenpark. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
