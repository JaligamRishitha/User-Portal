import Icon from '../components/Icon';

const PandC = () => (
    <div className="flex flex-col items-center justify-center min-h-[50vh] animate-fade-in p-6">
        <div className="max-w-6xl w-full bg-white rounded-2xl shadow-xl border border-zinc-200 overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-orange-500 to-red-600"></div>
            <div className="p-8">
                <div className="w-14 h-14 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center mb-6">
                    <Icon icon="lucide:zap" className="text-3xl" />
                </div>
                <h2 className="text-3xl font-bold text-zinc-900 mb-8">Power & Compensation</h2>

                {/* FAQ Section */}
                <div className="space-y-6">
                    {/* Question 1 */}
                    <div className="bg-zinc-50 rounded-xl p-6 border border-zinc-200">
                        <h3 className="text-lg font-bold text-zinc-900 mb-3 flex items-start gap-2">
                            <Icon icon="lucide:help-circle" className="text-orange-600 mt-1 flex-shrink-0" />
                            Why is electrical equipment sometimes on people's land?
                        </h3>
                        <p className="text-zinc-600 leading-relaxed">
                            To enable us to supply electricity to all homes and businesses within our area, it is sometimes necessary to place our equipment (both overhead and underground) on private land.
                        </p>
                    </div>

                    {/* Question 2 */}
                    <div className="bg-zinc-50 rounded-xl p-6 border border-zinc-200">
                        <h3 className="text-lg font-bold text-zinc-900 mb-3 flex items-start gap-2">
                            <Icon icon="lucide:file-text" className="text-orange-600 mt-1 flex-shrink-0" />
                            How do we get permission to put electrical equipment on people's land?
                        </h3>
                        <p className="text-zinc-600 leading-relaxed mb-4">
                            Rights for electrical equipment is often granted through either a:
                        </p>
                        <ul className="space-y-3 ml-4">
                            <li className="flex items-start gap-3">
                                <span className="w-2 h-2 bg-orange-600 rounded-full mt-2 flex-shrink-0"></span>
                                <div>
                                    <span className="font-semibold text-zinc-900">Wayleave Agreement</span>
                                    <span className="text-zinc-600">, which is a personal agreement between us and the landowner.</span>
                                </div>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="w-2 h-2 bg-orange-600 rounded-full mt-2 flex-shrink-0"></span>
                                <div>
                                    <span className="font-semibold text-zinc-900">Deed of Easement</span>
                                    <span className="text-zinc-600">, which is a permanent right registered against the title deeds of your property.</span>
                                </div>
                            </li>
                        </ul>
                        <p className="text-zinc-600 leading-relaxed mt-4">
                            These agreements set out the various rights and obligations between us and the landowner (Grantor). It also sets out our commitments to maintain and operate our equipment on your property in a reliable and safe way.
                        </p>
                        <p className="text-zinc-600 leading-relaxed mt-4">
                            Where an electricity substation is located on your property or within your building, we will generally hold a Lease or Freehold interest in the land with associated access and cable rights. To ensure power supplies are restored quickly if a fault occurs, access to a substation must be maintained and kept unrestricted at all times.
                        </p>
                    </div>

                    {/* Question 3 */}
                    <div className="bg-zinc-50 rounded-xl p-6 border border-zinc-200">
                        <h3 className="text-lg font-bold text-zinc-900 mb-3 flex items-start gap-2">
                            <Icon icon="lucide:users" className="text-orange-600 mt-1 flex-shrink-0" />
                            Can I ask a power lines claim company or agent to act on my behalf?
                        </h3>
                        <p className="text-zinc-600 leading-relaxed">
                            Yes, we are aware of a number of 'Power line Claim' companies who act on behalf of private landowners. They will contact us on your behalf. Some offering no fee, a one-off fee or a percentage of a settlement figure.
                        </p>
                    </div>
                </div>

                {/* More Info Button */}
                <div className="mt-8 flex justify-center">
                    <button
                        onClick={() => window.open('https://www.ukpowernetworks.co.uk/', '_blank')}
                        className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-orange-600 to-red-600 text-white font-semibold rounded-xl hover:from-orange-700 hover:to-red-700 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                    >
                        <Icon icon="lucide:external-link" className="text-xl" />
                        More Information
                    </button>
                </div>
            </div>
        </div>
    </div>
);

export default PandC;
